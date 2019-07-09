import * as os from 'os'
import { pathOr, pickBy } from 'ramda'
import { pollForTasks, ackTask, updateTask, TaskBody, TaskStatus, TaskData } from './connector'
import jaegerClient from 'jaeger-client-utility'
import { FORMAT_TEXT_MAP } from 'opentracing'

jaegerClient.init({
  serviceName: process.env.APP_NAME || process.env.JAEGER_SERVICE_NAME || 'unnamed-app'
})

const MAX_32_INT = 2147483647

const DEFAULT_OPTIONS = {
  pollingIntervals: 1000,
  baseURL: 'http://localhost:8080/api',
  maxRunner: 1,
  autoAck: true,
  workerID: os.hostname()
}

export type ConductorOption = {
  baseURL: string
  workerID: string
  pollingIntervals: number
  maxRunner: number
  autoAck: boolean
}

export type CallbackUpdater = {
  (
    {
      status,
      outputData,
      reasonForIncompletion,
      ...extraTaskData
    }: {
      [x: string]: any
      status: any
      outputData: any
      reasonForIncompletion?: string
    }
  ): Promise<any>
  complete({ outputData, ...extraTaskData }: { [x: string]: any; outputData: any }): Promise<any>
  fail({
    outputData,
    reasonForIncompletion,
    ...extraTaskData
  }: {
    [x: string]: any
    outputData: any
    reasonForIncompletion?: string
  }): Promise<any>
  inprogress({
    outputData,
    callbackAfterSeconds,
    ...extraTaskData
  }: {
    [x: string]: any
    outputData: any
    callbackAfterSeconds?: number
  }): Promise<any>
}

export type CallbackFunction = (task: TaskData, callbackUpdater: CallbackUpdater) => any

export default class Watcher {
  private isPolling: boolean = false
  private tasks: any = {}
  private tasksTimeout: any = {}
  private startTime: Date

  private taskType: string
  private options: ConductorOption
  private callback: CallbackFunction
  private errorCallback: Function

  constructor(
    taskType: string,
    options: ConductorOption,
    callback: CallbackFunction,
    errorCallback: Function = f => f
  ) {
    if (!callback) throw new Error('Callback function is required')
    this.taskType = taskType
    this.options = { ...DEFAULT_OPTIONS, ...options }
    this.callback = callback
    this.errorCallback = errorCallback
    this.polling()
  }

  destroyTaskTimeout = (taskId: string) => {
    clearTimeout(this.tasksTimeout[taskId])
    delete this.tasks[taskId]
  }

  destroyTask = (taskId: string) => delete this.tasks[taskId]

  ackTask = (taskId: string) => ackTask(this.options.baseURL, taskId, this.options.workerID)

  updateResult = async (taskBody: TaskBody) => {
    try {
      const result = await updateTask(this.options.baseURL, taskBody)
      // if ([TaskStatus.IN_PROGRESS, TaskStatus.FAILED, TaskStatus.COMPLETED].includes(status)) {
      //   this.destroyTaskTimeout(taskId)
      //   this.destroyTask(taskId)
      // }
      return result
    } catch (error) {
      throw error
    }
  }

  getUpdater = (task: TaskData, initOutData: any): CallbackUpdater => {
    const callbackUpdater = ({
      status,
      outputData,
      reasonForIncompletion = '',
      ...extraTaskData
    }) =>
      this.updateResult({
        workflowInstanceId: task.workflowInstanceId,
        taskId: task.taskId,
        reasonForIncompletion,
        status,
        outputData: { ...initOutData, ...outputData },
        ...extraTaskData
      })

    callbackUpdater.complete = ({ outputData, ...extraTaskData }) =>
      this.updateResult({
        workflowInstanceId: task.workflowInstanceId,
        taskId: task.taskId,
        status: TaskStatus.COMPLETED,
        outputData: { ...initOutData, ...outputData },
        ...extraTaskData
      })

    callbackUpdater.fail = ({ outputData, reasonForIncompletion = '', ...extraTaskData }) =>
      this.updateResult({
        workflowInstanceId: task.workflowInstanceId,
        taskId: task.taskId,
        reasonForIncompletion,
        status: TaskStatus.FAILED,
        outputData: { ...initOutData, ...outputData },
        ...extraTaskData
      })

    callbackUpdater.inprogress = ({
      outputData,
      callbackAfterSeconds = Number.MAX_SAFE_INTEGER,
      ...extraTaskData
    }) =>
      this.updateResult({
        workflowInstanceId: task.workflowInstanceId,
        taskId: task.taskId,
        status: TaskStatus.IN_PROGRESS,
        outputData: { ...initOutData, ...outputData },
        callbackAfterSeconds,
        ...extraTaskData
      })
    return callbackUpdater
  }

  private polling = async () => {
    this.startTime = new Date()
    try {
      if (this.isPolling) {
        const { baseURL, workerID } = this.options
        const freeRunnersCount = this.options.maxRunner - Object.keys(this.tasks).length
        if (freeRunnersCount > 0) {
          const rasp = await pollForTasks(baseURL, this.taskType, workerID, freeRunnersCount)
          const tasks = pathOr([], ['data'], rasp)
          tasks.map(this.ackTaskThenCallback)
        }
      }
    } catch (error) {
      this.errorCallback(error)
    } finally {
      setTimeout(
        this.polling,
        this.options.pollingIntervals - (new Date().getTime() - this.startTime.getTime())
      )
    }
  }

  ackTaskThenCallback = async task => {
    this.tasks[task.taskId] = task
    try {
      if (this.options.autoAck === true) await this.ackTask(task.taskId)
      if (task.responseTimeoutSeconds > 0 && task.responseTimeoutSeconds <= MAX_32_INT) {
        this.tasksTimeout[task.taskId] = setTimeout(() => {
          this.destroyTask(task.taskId)
          this.errorCallback(new Error(`Task "${task.taskId}" is not update in time`))
        }, task.responseTimeoutSeconds)
      }
    } catch (error) {
      // Handle ack error here
    }

    const parentSpan = jaegerClient.getParentSpan(FORMAT_TEXT_MAP, pickBy(f => f, task.inputData))
    const span = jaegerClient.startSpan(task.taskType, { childOf: parentSpan })
    const jaegerTrace = {}
    jaegerClient.inject(span, FORMAT_TEXT_MAP, jaegerTrace)
    const callbackUpdater = this.getUpdater(task, jaegerTrace)
    if (!parentSpan._traceId && task.inputData.orderId) {
      span.setTag('workflowType', task.workflowType)
      span.setTag('workflowInstanceId', task.workflowInstanceId)
      span.setTag('taskId', task.taskId)
      span.setTag('retryCount', task.retryCount)
      span.setTag('pollCount', task.pollCount)
      span.setTag('seq', task.seq)
      span.setTag('orderId', task.inputData.orderId)
    }

    try {
      await this.callback({ ...task, ...jaegerTrace }, callbackUpdater)
    } catch (error) {
      span.setTag('error', error instanceof Error ? error.toString() : error)
      this.updateResult({
        workflowInstanceId: task.workflowInstanceId,
        taskId: task.taskId,
        reasonForIncompletion: error.message,
        status: TaskStatus.FAILED
      })
    } finally {
      span.finish()
      this.destroyTaskTimeout(task.taskId)
      this.destroyTask(task.taskId)
    }
  }

  startPolling = () => {
    if (this.isPolling) throw new Error('Watcher is already started')
    this.isPolling = true
    this.startTime = new Date()
  }

  stopPolling = () => {
    this.isPolling = false
  }
}

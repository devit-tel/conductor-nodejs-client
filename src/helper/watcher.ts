import * as os from 'os'
import { pathOr, type } from 'ramda'
import { pollForTasks, ackTask, updateTask, TaskBody, TaskStatus, TaskData } from './connector'

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

  getUpdater = (task: TaskData): CallbackUpdater => {
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
        outputData,
        ...extraTaskData
      })

    callbackUpdater.complete = ({ outputData, ...extraTaskData }) =>
      this.updateResult({
        workflowInstanceId: task.workflowInstanceId,
        taskId: task.taskId,
        status: TaskStatus.COMPLETED,
        outputData,
        ...extraTaskData
      })

    callbackUpdater.fail = ({ outputData, reasonForIncompletion = '', ...extraTaskData }) =>
      this.updateResult({
        workflowInstanceId: task.workflowInstanceId,
        taskId: task.taskId,
        reasonForIncompletion,
        status: TaskStatus.FAILED,
        outputData,
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
        outputData,
        callbackAfterSeconds,
        ...extraTaskData
      })
    return callbackUpdater
  }

  // this should be private function
  polling = async () => {
    this.startTime = new Date()
    try {
      const { baseURL, workerID } = this.options
      const freeRunnersCount = this.options.maxRunner - Object.keys(this.tasks).length
      if (freeRunnersCount > 0) {
        const rasp = await pollForTasks(baseURL, this.taskType, workerID, freeRunnersCount)
        const tasks = pathOr([], ['data'], rasp)
        tasks.map(this.ackTaskThenCallback)
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
      if (task.responseTimeoutSeconds > 0) {
        this.tasksTimeout[task.taskId] = setTimeout(
          () => {
            this.destroyTask(task.taskId)
            this.errorCallback(new Error(`Task "${task.taskId}" is not update in time`))
          },
          task.responseTimeoutSeconds < Number.MAX_SAFE_INTEGER
            ? task.responseTimeoutSeconds * 1000
            : Number.MAX_SAFE_INTEGER
        )
      }
    } catch (error) {
      // Handle ack error here
    }

    const callbackUpdater = this.getUpdater(task)
    try {
      const cb = this.callback(task, callbackUpdater)
      if (type(cb) === 'Promise') {
        cb.then(() => {
          this.destroyTaskTimeout(task.taskId)
          this.destroyTask(task.taskId)
        }).catch(error => {
          this.updateResult({
            workflowInstanceId: task.workflowInstanceId,
            taskId: task.taskId,
            reasonForIncompletion: error.message,
            status: TaskStatus.FAILED
          })
        })
      } else {
        this.destroyTaskTimeout(task.taskId)
        this.destroyTask(task.taskId)
      }
    } catch (error) {
      this.updateResult({
        workflowInstanceId: task.workflowInstanceId,
        taskId: task.taskId,
        reasonForIncompletion: error.message,
        status: TaskStatus.FAILED
      })
    }
  }

  startPolling = () => {
    if (this.isPolling) throw new Error('Watcher is already started')
    this.isPolling = true
    this.startTime = new Date()
    this.polling()
  }
}

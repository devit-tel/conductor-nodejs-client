import os from 'os'
import { pathOr, type } from 'ramda'
import { pollForTasks, ackTask, updateTask } from './connector'

const DEFAULT_OPTIONS = {
  pollingIntervals: 1000,
  baseURL: 'http://localhost:8080/api',
  maxRunner: 1,
  autoAck: true,
  workerID: os.hostname()
}

const TASK_STATUS = {
  IN_PROGRESS: 'IN_PROGRESS',
  FAILED: 'FAILED',
  COMPLETED: 'COMPLETED'
}

export default class Watcher {
  isPolling = false
  tasks = {}
  tasksTimeout = {}

  constructor(taskType, options, callback, errorCallback = f => f) {
    if (!callback) throw new Error('Callback function is required')
    this.taskType = taskType
    this.options = { ...DEFAULT_OPTIONS, ...options }
    this.callback = callback
    this.errorCallback = errorCallback
  }

  destroyTaskTimeout = taskId => {
    clearTimeout(this.tasksTimeout[taskId])
    delete this.tasks[taskId]
  }

  destroyTask = taskId => delete this.tasks[taskId]

  ackTask = taskId => ackTask(this.options.baseURL, taskId, this.options.workerID)

  updateResult = async ({
    workflowInstanceId,
    taskId,
    reasonForIncompletion,
    status,
    outputData = {},
    ...extraTaskData
  }) => {
    try {
      const result = updateTask(this.options.baseURL, {
        workflowInstanceId,
        taskId,
        reasonForIncompletion,
        status,
        outputData,
        ...extraTaskData
      })
      // if ([TASK_STATUS.IN_PROGRESS, TASK_STATUS.FAILED, TASK_STATUS.COMPLETED].includes(status)) {
      //   this.destroyTaskTimeout(taskId)
      //   this.destroyTask(taskId)
      // }
      return result
    } catch (error) {
      throw error
    }
  }

  getUpdater = task => {
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

    callbackUpdater.complete = ({ outputData, reasonForIncompletion = '', ...extraTaskData }) =>
      this.updateResult({
        workflowInstanceId: task.workflowInstanceId,
        taskId: task.taskId,
        reasonForIncompletion,
        status: TASK_STATUS.COMPLETED,
        outputData,
        ...extraTaskData
      })

    callbackUpdater.fail = ({ outputData, reasonForIncompletion = '', ...extraTaskData }) =>
      this.updateResult({
        workflowInstanceId: task.workflowInstanceId,
        taskId: task.taskId,
        reasonForIncompletion,
        status: TASK_STATUS.FAILED,
        outputData,
        ...extraTaskData
      })
    callbackUpdater.inprogress = ({ outputData, reasonForIncompletion = '', ...extraTaskData }) =>
      this.updateResult({
        workflowInstanceId: task.workflowInstanceId,
        taskId: task.taskId,
        reasonForIncompletion,
        status: TASK_STATUS.IN_PROGRESS,
        outputData,
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
      console.log(freeRunnersCount)
      if (freeRunnersCount > 0) {
        const rasp = await pollForTasks(baseURL, this.taskType, workerID, freeRunnersCount)
        const tasks = pathOr([], ['data'], rasp)

        for (const task of tasks) {
          this.tasks[task.taskId] = task
          if (this.options.autoAck === true) await this.ackTask(task.taskId)
          if (task.responseTimeoutSeconds > 0) {
            this.tasksTimeout[task.taskId] = setTimeout(() => {
              this.destroyTask(task.taskId)
              this.errorCallback(new Error(`Task "${task.taskId}" is not update in time`))
            }, task.responseTimeoutSeconds * 1000)
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
                  status: TASK_STATUS.FAILED
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
              status: TASK_STATUS.FAILED
            })
          }
        }
      }
    } catch (error) {
      this.errorCallback(error)
    } finally {
      setTimeout(this.polling, this.options.pollingIntervals - (new Date() - this.startTime))
    }
  }

  startPolling = () => {
    if (this.isPolling) throw new Error('Watcher is already started')
    this.isPolling = true
    this.startTime = new Date()
    this.polling()
  }
}

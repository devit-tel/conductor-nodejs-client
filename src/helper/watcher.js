import { pollForTask, ackTask, updateTask } from './connector'

const DEFAULT_OPTIONS = {
  pollingIntervals: 1000,
  baseURL: 'http://localhost:8080/api',
  maxRunner: 1,
  autoAck: true,
  workerID: undefined
}

export default class Watcher {
  isPolling = false
  runners = []

  constructor(taskType, options, callback, errorCallback = f => f) {
    if (!callback) throw new Error('Callback function is required')
    this.taskType = taskType
    this.options = { ...DEFAULT_OPTIONS, ...options }
    this.callback = callback
    this.errorCallback = errorCallback
  }

  destroyTask = taskId => {
    const taskIndex = this.tasks.findIndex(task => task.taskId === taskId)
    if (taskIndex >= 0) {
      this.tasks.splice(taskIndex, 1)
    }
  }

  ackTask = taskId => ackTask(this.options.baseURL, taskId, this.options.workerID)

  updateResult = ({ workflowInstanceId, taskId, reasonForIncompletion, status, outputData = {} }) =>
    updateTask(this.options.baseURL, {
      workflowInstanceId,
      taskId,
      reasonForIncompletion,
      status,
      outputData
    })

  // this should be private function
  polling = async () => {
    this.startTime = new Date()
    try {
      if (this.options.maxRunner >= this.runners.length) {
        const { baseURL, workerID } = this.options
        const { data } = await pollForTask(baseURL, this.taskType, workerID)
        if (data) {
          this.runners.push(data)
          if (this.options.autoAck === true) await this.ackTask(data.taskId)

          if (data.responseTimeoutSeconds > 0) {
            // TODO dont forget to kill this when task is updated
            setTimeout(() => {
              this.destroyTask(data.taskId)
              this.errorCallback(new Error(`Task "${data.taskId}" is not update in time`))
            }, data.responseTimeoutSeconds * 1000)
          }

          this.callback(data, ({ status, outputData, reasonForIncompletion = '' }) =>
            // This make life more easier
            this.updateResult({
              workflowInstanceId: data.workflowInstanceId,
              taskId: data.taskId,
              reasonForIncompletion,
              status,
              outputData
            })
          )
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

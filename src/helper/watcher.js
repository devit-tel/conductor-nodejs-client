import { pollForTask } from './connector'

const DEFAULT_OPTIONS = {
  pollingIntervals: 1000,
  baseURL: 'http://localhost:8080/api'
}

export default class Watcher {
  isPolling = false

  constructor(taskType, options, callback, errorCallback = f => f) {
    if (!callback) throw new Error('Callback function is required')
    this.taskType = taskType
    this.options = { ...DEFAULT_OPTIONS, ...options }
    this.callback = callback
    this.errorCallback = errorCallback
  }

  // this should be private function
  polling = async () => {
    this.startTime = new Date()
    try {
      const { baseURL, workerID } = this.options
      const { data } = await pollForTask(baseURL, this.taskType, workerID)
      if (data) {
        this.callback(data)
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

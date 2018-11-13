// import { fork } from 'child_process'
import os from 'os'
import Watcher from './helper/watcher'

export const DEFAULT_OPTIONS = {
  workerId: os.hostname()
}

export default class ConductorClient {
  constructor(options) {
    this.options = { ...DEFAULT_OPTIONS, ...options }
    this.tasks = {}
  }

  registerWatcher = (
    taskType,
    callback = f => f,
    pollingIntervals = 1000,
    startPolling = false
  ) => {
    if (!taskType) throw new Error('Task type is required for registering watcher')
    if (this.tasks[taskType]) throw new Error(`Task "${taskType}" is already registered`)
    this.tasks[taskType] = new Watcher(
      taskType,
      { pollingIntervals, baseURL: this.options.baseURL },
      callback,
      console.error
    )
    if (startPolling) this.tasks[taskType].startPolling()
  }

  startPolling = () => {
    for (const taskType in this.tasks) {
      if (this.tasks[taskType].isPolling === false) this.tasks[taskType].startPolling()
    }
  }
}

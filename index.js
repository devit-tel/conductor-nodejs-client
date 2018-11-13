import { fork } from 'child_process'
import os from 'os'

const HOSTNAME = os.hostname()
const DEFAULT_OPTIONS = {
  pollingTime: 5,
  baseURL: 'http://localhost:8080',
  taskID: HOSTNAME,
  taskType: null
}

let workers = []

export function registerWatcher (workerPath, options = {}) {
  let worker = fork(workerPath)
  options = {...DEFAULT_OPTIONS, ...options}

  if (!options.taskType) {
    throw new Error('Task type is required for registering watcher')
  }
  worker.send({
    type: 'REGISTER_TASK',
    options: options
  })

  workers.push(worker)
}

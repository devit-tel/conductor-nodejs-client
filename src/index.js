import os from 'os'
import Watcher from './helper/watcher'
import {
  getWorkflowDefinition,
  getAllWorkflowDefs,
  createWorkflowDef,
  updateWorkflowDefs,
  unRegisterWorkflowDef,
  getTaskDef,
  getAllTaskDefs,
  registerTaskDefs,
  updateTaskDef,
  unRegisterTaskDef,
  startWorkflow,
  terminateWorkflow,
  pauseWorkflow,
  resumeWorkflow,
  skipTaskFromWorkflow,
  rerunWorkflow,
  restartWorkflow,
  getWorkflow,
  getRunningWorkflows,
  searchWorkflows,
  updateTask
} from './helper/connector'

export const DEFAULT_OPTIONS = {
  baseURL: 'http://localhost:8080/api',
  workerID: os.hostname()
}

export default class ConductorClient {
  constructor(options) {
    this.options = { ...DEFAULT_OPTIONS, ...options }
    this.tasks = {}
  }

  getWorkflowDefinition = (workflowName, varsion = 1) =>
    getWorkflowDefinition(this.options.baseURL, workflowName, varsion)

  getAllWorkflowDefs = () => getAllWorkflowDefs(this.options.baseURL)

  createWorkflowDef = workflowDefBody => createWorkflowDef(this.options.baseURL, workflowDefBody)

  updateWorkflowDefs = (workflowDefsBody = []) =>
    updateWorkflowDefs(this.options.baseURL, workflowDefsBody)

  unRegisterWorkflowDef = (workflowDefName, version = 1) =>
    unRegisterWorkflowDef(this.options.baseURL, workflowDefName, version)

  getTaskDef = taskDefName => getTaskDef(this.options.baseURL, taskDefName)

  getAllTaskDefs = () => getAllTaskDefs(this.options.baseURL)

  registerTaskDefs = (taskDefsMeta = []) => registerTaskDefs(this.options.baseURL, taskDefsMeta)

  updateTaskDef = taskDefMeta => updateTaskDef(this.options.baseURL, taskDefMeta)

  unRegisterTaskDef = taskDefName => unRegisterTaskDef(this.options.baseURL, taskDefName)

  getWorkflow = (workflowId, includeTasks = true) =>
    getWorkflow(this.options.baseURL, workflowId, includeTasks)

  searchWorkflows = (start = 0, size = 20, sort = 'ASC:createTime', freeText, query) =>
    searchWorkflows(this.options.baseURL, start, size, sort, freeText, query)

  getRunningWorkflows = (workflowName, version = '1') =>
    getRunningWorkflows(this.options.baseURL, workflowName, (version = '1'))

  startWorkflow = (workflowName, input, version = 1, correlationId) =>
    startWorkflow(this.options.baseURL, workflowName, version, correlationId, input)

  restartWorkflow = workflowId => restartWorkflow(this.options.baseURL, workflowId)

  terminateWorkflow = (workflowId, reason = '') =>
    terminateWorkflow(this.options.baseURL, workflowId, reason)

  pauseWorkflow = workflowId => pauseWorkflow(this.options.baseURL, workflowId)

  resumeWorkflow = workflowId => resumeWorkflow(this.options.baseURL, workflowId)

  skipTaskFromWorkflow = (workflowId, taskReferenceName, taskInput, taskOutput) =>
    skipTaskFromWorkflow(this.options.baseURL, workflowId, taskReferenceName, {
      taskInput,
      taskOutput
    })

  rerunWorkflow = (
    workflowId,
    reRunFromWorkflowId,
    workflowInput = {},
    reRunFromTaskId,
    taskInput = {}
  ) =>
    rerunWorkflow(this.options.baseURL, workflowId, {
      reRunFromWorkflowId,
      workflowInput,
      reRunFromTaskId,
      taskInput
    })

  updateTask = taskBody => updateTask(this.options.baseURL, taskBody)

  registerWatcher = (taskType, callback = f => f, options = {}, startPolling = false) => {
    if (!taskType) throw new Error('Task type is required for registering watcher')
    if (this.tasks[taskType]) throw new Error(`Task "${taskType}" is already registered`)
    this.tasks[taskType] = new Watcher(taskType, { ...this.options, ...options }, callback)
    if (startPolling) this.tasks[taskType].startPolling()
    return this.tasks[taskType]
  }

  startPolling = () => {
    for (const taskType in this.tasks) {
      if (this.tasks[taskType].isPolling === false) this.tasks[taskType].startPolling()
    }
  }
}

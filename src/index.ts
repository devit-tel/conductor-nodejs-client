import * as os from 'os'
import Watcher, { ConductorOption, CallbackFunction } from './helper/watcher'
import {
  TaskBody,
  TaskDefinition,
  WorkflowDefinition,
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
  deleteWorkflowFromSystem,
  pauseWorkflow,
  resumeWorkflow,
  skipTaskFromWorkflow,
  rerunWorkflow,
  retryWorkflow,
  restartWorkflow,
  getWorkflow,
  getRunningWorkflows,
  searchWorkflows,
  updateTask,
  getTask
} from './helper/connector'

export const DEFAULT_OPTIONS = {
  baseURL: 'http://localhost:8080/api',
  workerID: os.hostname()
}

export default class ConductorClient {
  private options: ConductorOption
  private tasks: any = {}

  constructor(options: ConductorOption) {
    this.options = { ...DEFAULT_OPTIONS, ...options }
  }

  getWorkflowDefinition = (workflowName: string, version: number = 1) =>
    getWorkflowDefinition(this.options.baseURL, workflowName, version)

  getAllWorkflowDefs = () => getAllWorkflowDefs(this.options.baseURL)

  createWorkflowDef = (workflowDefBody: WorkflowDefinition) =>
    createWorkflowDef(this.options.baseURL, workflowDefBody)

  updateWorkflowDefs = (workflowDefsBody: [WorkflowDefinition]) =>
    updateWorkflowDefs(this.options.baseURL, workflowDefsBody)

  unRegisterWorkflowDef = (workflowDefName: string, version: number = 1) =>
    unRegisterWorkflowDef(this.options.baseURL, workflowDefName, version)

  getTaskDef = (taskDefName: string) => getTaskDef(this.options.baseURL, taskDefName)

  getAllTaskDefs = () => getAllTaskDefs(this.options.baseURL)

  registerTaskDefs = (taskDefsMeta: [TaskDefinition]) =>
    registerTaskDefs(this.options.baseURL, taskDefsMeta)

  updateTaskDef = (taskDefMeta: TaskDefinition) => updateTaskDef(this.options.baseURL, taskDefMeta)

  unRegisterTaskDef = (taskDefName: string) => unRegisterTaskDef(this.options.baseURL, taskDefName)

  updateTask = (taskBody: TaskBody) => updateTask(this.options.baseURL, taskBody)

  getTask = (taskID: string) => getTask(this.options.baseURL, taskID)

  getWorkflow = (workflowId: string, includeTasks: boolean = true) =>
    getWorkflow(this.options.baseURL, workflowId, includeTasks)

  searchWorkflows = (
    start: number = 0,
    size: number = 20,
    sort: string = 'ASC:createTime',
    freeText: string,
    query: any
  ) => searchWorkflows(this.options.baseURL, start, size, sort, freeText, query)

  getRunningWorkflows = (workflowName: string, version: number = 1) =>
    getRunningWorkflows(this.options.baseURL, workflowName, version)

  startWorkflow = (workflowName: string, input: any, version: number = 1, correlationId?: string) =>
    startWorkflow(this.options.baseURL, workflowName, version, correlationId, input)

  restartWorkflow = (workflowId: string) => restartWorkflow(this.options.baseURL, workflowId)

  terminateWorkflow = (workflowId: string, reason: string = '') =>
    terminateWorkflow(this.options.baseURL, workflowId, reason)

  deleteWorkflowFromSystem = (workflowId: string, reason: string) =>
    deleteWorkflowFromSystem(this.options.baseURL, workflowId, reason)

  pauseWorkflow = (workflowId: string) => pauseWorkflow(this.options.baseURL, workflowId)

  resumeWorkflow = (workflowId: string) => resumeWorkflow(this.options.baseURL, workflowId)

  retryWorkflow = (workflowId: string) => retryWorkflow(this.options.baseURL, workflowId)

  skipTaskFromWorkflow = (
    workflowId: string,
    taskReferenceName: string,
    taskInput: any,
    taskOutput: any
  ) =>
    skipTaskFromWorkflow(this.options.baseURL, workflowId, taskReferenceName, taskInput, taskOutput)

  rerunWorkflow = (
    workflowId: string,
    reRunFromWorkflowId: string,
    workflowInput: any = {},
    reRunFromTaskId: string,
    taskInput: any = {}
  ) =>
    rerunWorkflow(this.options.baseURL, workflowId, {
      reRunFromWorkflowId,
      workflowInput,
      reRunFromTaskId,
      taskInput
    })

  registerWatcher = (
    taskType: string,
    callback: CallbackFunction = f => f,
    options: ConductorOption,
    startPolling: boolean = false
  ) => {
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

import HTTPClient from 'axios'

HTTPClient.defaults.headers['Content-Type'] = 'application/json'

export type TaskDefinition = {
  name: string
  retryCount: number
  timeoutSeconds: number
  inputKeys: [string]
  outputKeys: [string]
  timeoutPolicy: string
  retryLogic: string
  retryDelaySeconds: number
  responseTimeoutSeconds: number
  concurrentExecLimit: number
  rateLimitFrequencyInSeconds: number
  rateLimitPerFrequency: number
}

export type WorkflowTaskDefinition = {
  name: string
  taskReferenceName: string
  type: string
  inputParameters: any
  startDelay: number
  optional: boolean
}

export type WorkflowDefinition = {
  name: string
  description: string
  version: number
  tasks: [WorkflowTaskDefinition]
  outputParameters: any
  failureWorkflow: string
  restartable: boolean
  workflowStatusListenerEnabled: boolean
  schemaVersion: number
}

export enum TaskStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  FAILED = 'FAILED',
  COMPLETED = 'COMPLETED'
}

export type TaskBody = {
  workflowInstanceId: string
  taskId: string
  reasonForIncompletion?: string
  callbackAfterSeconds?: number
  status: TaskStatus
  outputData?: any
}

export type TaskData = {
  taskType: string
  status: string
  inputData: any
  referenceTaskName: string
  retryCount: number
  seq: number
  pollCount: number
  taskDefName: string
  scheduledTime: number
  startTime: number
  endTime: number
  updateTime: number
  startDelayInSeconds: number
  retried: boolean
  executed: boolean
  callbackFromWorker: boolean
  responseTimeoutSeconds: number
  workflowInstanceId: string
  workflowType: string
  taskId: string
  callbackAfterSeconds: number
  outputData: any
  workflowTask: {
    name: string
    taskReferenceName: string
    type: string
    inputParameters: any
    startDelay: number
    optional: boolean
    taskDefinition: TaskDefinition
  }
  rateLimitPerFrequency: number
  rateLimitFrequencyInSeconds: number
  taskDefinition: any
  taskStatus: string
  queueWaitTime: number
  logs: [string]
  'uber-trace-id': string
}

export const getWorkflowDefinition = (baseURL: string, workflowName: string, version: number = 1) =>
  HTTPClient({
    method: 'get',
    baseURL,
    url: `/metadata/workflow/${workflowName}`,
    params: {
      version
    }
  })

export function createWorkflowDef(baseURL: string, workflowDefBody: WorkflowDefinition) {
  return HTTPClient({
    method: 'post',
    baseURL,
    url: '/metadata/workflow',
    data: workflowDefBody
  })
}

export function updateWorkflowDefs(baseURL: string, workflowDefsBody: [WorkflowDefinition]) {
  return HTTPClient({
    method: 'put',
    baseURL,
    url: '/metadata/workflow',
    data: workflowDefsBody
  })
}

export function getAllWorkflowDefs(baseURL: string) {
  return HTTPClient({
    method: 'get',
    baseURL,
    url: '/metadata/workflow'
  })
}

export function unRegisterWorkflowDef(
  baseURL: string,
  workflowDefName: string,
  version: number = 1
) {
  return HTTPClient({
    method: 'delete',
    baseURL,
    url: `/metadata/workflow/${workflowDefName}/${version}`,
    params: {
      version
    }
  })
}

export function getTaskDef(baseURL: string, taskDefName: string) {
  return HTTPClient({
    method: 'get',
    baseURL,
    url: `/metadata/taskdefs/${taskDefName}`
  })
}

export function registerTaskDefs(baseURL: string, taskDefsMeta: [TaskDefinition]) {
  return HTTPClient({
    method: 'post',
    baseURL,
    url: '/metadata/taskdefs',
    data: taskDefsMeta
  })
}

export function updateTaskDef(baseURL: string, taskDefMeta: TaskDefinition) {
  return HTTPClient({
    method: 'put',
    baseURL,
    url: '/metadata/taskdefs',
    data: taskDefMeta
  })
}

export function unRegisterTaskDef(baseURL: string, taskDefName: string) {
  return HTTPClient({
    method: 'delete',
    baseURL,
    url: `/metadata/taskdefs/${taskDefName}`
  })
}

export function getAllTaskDefs(baseURL: string) {
  return HTTPClient({
    method: 'get',
    baseURL,
    url: '/metadata/taskdefs'
  })
}

/** ********************/
/* Task Functions	  */
/** ********************/

export function getTask(baseURL: string, taskID: string) {
  return HTTPClient({
    method: 'get',
    baseURL,
    url: `/tasks/${taskID}`
  })
}

export function updateTask(baseURL: string, taskBody: TaskBody) {
  return HTTPClient({
    method: 'post',
    baseURL,
    url: '/tasks',
    data: taskBody
  })
}

export function pollForTask(baseURL: string, taskType: string, workerID: string) {
  return HTTPClient({
    method: 'get',
    baseURL,
    url: `/tasks/poll/${taskType}`,
    params: {
      workerid: workerID
    }
  })
}

export function pollForTasks(
  baseURL: string,
  taskType: string,
  workerID: string,
  count: number = 1
) {
  return HTTPClient({
    method: 'get',
    baseURL,
    url: `/tasks/poll/batch/${taskType}`,
    params: {
      workerid: workerID,
      count
    }
  })
}

export function ackTask(baseURL: string, taskType: string, workerId: string) {
  return HTTPClient({
    method: 'post',
    baseURL,
    url: `/tasks/${taskType}/ack`,
    params: {
      workerid: workerId
    }
  })
}

export function getAllTasksInQueue(baseURL: string) {
  return HTTPClient({
    method: 'get',
    baseURL,
    url: '/tasks/queue/all'
  })
}

export function removeTaskFromQueue(baseURL: string, taskType: string, taskID: string) {
  return HTTPClient({
    method: 'delete',
    baseURL,
    url: `/tasks/queue/${taskType}/${taskID}`
  })
}

export function getTaskQueueSizes(baseURL: string, taskNames: string) {
  return HTTPClient({
    method: 'post',
    baseURL,
    url: '/tasks/queue/sizes',
    data: taskNames
  })
}

/** ********************/
/* Workflow Functions */
/** ********************/

export function getWorkflow(baseURL: string, workflowId: string, includeTasks: boolean = true) {
  return HTTPClient({
    method: 'get',
    baseURL,
    url: `/workflow/${workflowId}`,
    params: {
      includeTasks: includeTasks ? 'true' : 'false'
    }
  })
}

export function getRunningWorkflows(baseURL: string, workflowName: string, version: number = 1) {
  return HTTPClient({
    method: 'get',
    baseURL,
    url: `/workflow/running/${workflowName}`,
    params: {
      version
    }
  })
}

export function searchWorkflows(
  baseURL: string,
  start: number = 0,
  size: number = 20,
  sort: string = 'ASC:createTime',
  freeText: string,
  query: any
) {
  return HTTPClient({
    method: 'get',
    baseURL,
    url: '/workflow/search',
    params: {
      start,
      size,
      sort,
      freeText,
      query
    }
  })
}

export function startWorkflow(
  baseURL: string,
  workflowName: string,
  version: number = 1,
  correlationId: string,
  inputJson: any = {}
) {
  return HTTPClient({
    method: 'post',
    baseURL,
    url: `/workflow/${workflowName}`,
    params: {
      version,
      correlationId
    },
    data: inputJson
  })
}

export function terminateWorkflow(baseURL: string, workflowId: string, reason: string) {
  return HTTPClient({
    method: 'delete',
    baseURL,
    url: `/workflow/${workflowId}`,
    params: {
      reason
    }
  })
}

export function deleteWorkflowFromSystem(baseURL: string, workflowId: string, reason: string) {
  return HTTPClient({
    method: 'delete',
    baseURL,
    url: `/workflow/${workflowId}/remove`,
    params: {
      reason
    }
  })
}

export function pauseWorkflow(baseURL: string, workflowId: string) {
  return HTTPClient({
    method: 'put',
    baseURL,
    url: `/workflow/${workflowId}/pause`
  })
}

export function resumeWorkflow(baseURL: string, workflowId: string) {
  return HTTPClient({
    method: 'put',
    baseURL,
    url: `/workflow/${workflowId}/resume`
  })
}

export function skipTaskFromWorkflow(
  baseURL: string,
  workflowId: string,
  taskReferenceName: string,
  taskInput: any = {},
  taskOutput: any = {}
) {
  return HTTPClient({
    method: 'put',
    baseURL,
    url: `/workflow/${workflowId}/skiptask/${taskReferenceName}`,
    data: { taskInput, taskOutput }
  })
}

type RerunWorkflowRequest = {
  reRunFromWorkflowId: string
  workflowInput: any
  reRunFromTaskId: string
  taskInput: any
}

export function rerunWorkflow(
  baseURL: string,
  workflowId,
  rerunWorkflowRequest: RerunWorkflowRequest
) {
  return HTTPClient({
    method: 'post',
    baseURL,
    url: `/workflow/${workflowId}/rerun`,
    data: rerunWorkflowRequest
  })
}

export function retryWorkflow(baseURL: string, workflowId: string) {
  return HTTPClient({
    method: 'post',
    baseURL,
    url: `/workflow/${workflowId}/retry`
  })
}

export function restartWorkflow(baseURL: string, workflowId: string) {
  return HTTPClient({
    method: 'post',
    baseURL,
    url: `/workflow/${workflowId}/restart`
  })
}

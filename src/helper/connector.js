import HTTPClient from 'axios'

HTTPClient.defaults.headers['Content-Type'] = 'application/json'

export const getWorkflowDefinition = (baseURL, workflowName, version = '1') =>
  HTTPClient({
    method: 'get',
    baseURL,
    url: `/metadata/workflow/${workflowName}`,
    params: {
      version: version
    }
  })

export function createWorkflowDef(baseURL, workflowDefBody) {
  return HTTPClient({
    method: 'post',
    baseURL,
    url: '/metadata/workflow',
    data: workflowDefBody
  })
}

export function updateWorkflowDefs(baseURL, workflowDefsBody) {
  return HTTPClient({
    method: 'put',
    baseURL,
    url: '/metadata/workflow',
    data: workflowDefsBody
  })
}

export function getAllWorkflowDefs(baseURL) {
  return HTTPClient({
    method: 'get',
    baseURL,
    url: '/metadata/workflow'
  })
}

export function unRegisterWorkflowDef(baseURL, workflowDefName, version = '1') {
  return HTTPClient({
    method: 'delete',
    baseURL,
    url: `/metadata/workflow/${workflowDefName}/${version}`,
    params: {
      version: version
    }
  })
}

export function getTaskDef(baseURL, taskDefName) {
  return HTTPClient({
    method: 'get',
    baseURL,
    url: `/metadata/taskdefs/${taskDefName}`
  })
}

export function registerTaskDefs(baseURL, taskDefsMeta) {
  return HTTPClient({
    method: 'post',
    baseURL,
    url: '/metadata/taskdefs',
    data: taskDefsMeta
  })
}

export function updateTaskDef(baseURL, taskDefMeta) {
  return HTTPClient({
    method: 'put',
    baseURL,
    url: '/metadata/taskdefs',
    data: taskDefMeta
  })
}

export function unRegisterTaskDef(baseURL, taskDefName) {
  return HTTPClient({
    method: 'delete',
    baseURL,
    url: `/metadata/taskdefs/${taskDefName}`
  })
}

export function getAllTaskDefs(baseURL) {
  return HTTPClient({
    method: 'get',
    baseURL,
    url: '/metadata/taskdefs'
  })
}

/** ********************/
/* Task Functions	  */
/** ********************/

export function getTask(baseURL, taskID) {
  return HTTPClient({
    method: 'get',
    baseURL,
    url: `/tasks/${taskID}`
  })
}

export function updateTask(baseURL, taskBody) {
  return HTTPClient({
    method: 'post',
    baseURL,
    url: '/tasks',
    data: taskBody
  })
}

export function pollForTask(baseURL, taskType, workerID) {
  return HTTPClient({
    method: 'get',
    baseURL,
    url: `/tasks/poll/${taskType}`,
    params: {
      workerid: workerID
    }
  })
}

export function pollForTasks(baseURL, taskType, workerID, count = 1) {
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

export function ackTask(baseURL, taskType, workerID) {
  return HTTPClient({
    method: 'post',
    baseURL,
    url: `/tasks/${taskType}/ack`,
    params: {
      workerid: workerID
    }
  })
}

export function getAllTasksInQueue(baseURL) {
  return HTTPClient({
    method: 'get',
    baseURL,
    url: '/tasks/queue/all'
  })
}

export function removeTaskFromQueue(baseURL, taskType, taskID) {
  return HTTPClient({
    method: 'delete',
    baseURL,
    url: `/tasks/queue/${taskType}/${taskID}`
  })
}

export function getTaskQueueSizes(baseURL, taskNames) {
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

export function getWorkflow(baseURL, workflowId, includeTasks = true) {
  return HTTPClient({
    method: 'get',
    baseURL,
    url: `/workflow/${workflowId}`,
    params: {
      includeTasks: includeTasks ? 'true' : 'false'
    }
  })
}

export function getRunningWorkflows(baseURL, workflowName, version = '1', startTime, endTime) {
  return HTTPClient({
    method: 'get',
    baseURL,
    url: `/workflow/running/${workflowName}`,
    params: {
      version: version
      // startTime: ,
      // endTime:
    }
  })
  // Still need to recognize time format
  // if startTime != 0 {
  //   params["startTime"] = strconv.FormatFloat(startTime, 'f', -1, 64)
  // }
  // if endTime != 0 {
  //   params["endTime"] = strconv.FormatFloat(endTime, 'f', -1, 64)
  // }
}

export function searchWorkflows(
  baseURL,
  start = 0,
  size = 20,
  sort = 'ASC:createTime',
  freeText,
  query
) {
  return HTTPClient({
    method: 'get',
    baseURL,
    url: '/workflow/search',
    params: {
      start: '',
      size: '',
      sort: '',
      freeText: '',
      query: ''
    }
  })
}

export function startWorkflow(baseURL, workflowName, version = '1', correlationId, inputJson = {}) {
  return HTTPClient({
    method: 'post',
    baseURL,
    url: `/workflow/${workflowName}`,
    params: {
      version: version,
      correlationId: correlationId
    },
    data: inputJson
  })
}

export function terminateWorkflow(baseURL, workflowId, reason) {
  return HTTPClient({
    method: 'delete',
    baseURL,
    url: `/workflow/${workflowId}`,
    params: {
      reason
    }
  })
}

export function pauseWorkflow(baseURL, workflowId) {
  return HTTPClient({
    method: 'put',
    baseURL,
    url: `/workflow/${workflowId}/pause`
  })
}

export function resumeWorkflow(baseURL, workflowId) {
  return HTTPClient({
    method: 'put',
    baseURL,
    url: `/workflow/${workflowId}/resume`
  })
}

export function skipTaskFromWorkflow(baseURL, workflowId, taskReferenceName, skipTaskRequestBody) {
  return HTTPClient({
    method: 'put',
    baseURL,
    url: `/workflow/${workflowId}/skiptask/${taskReferenceName}`,
    data: skipTaskRequestBody
  })
}

export function rerunWorkflow(baseURL, workflowId, rerunWorkflowRequest = {}) {
  return HTTPClient({
    method: 'post',
    baseURL,
    url: `/workflow/${workflowId}/rerun`,
    data: rerunWorkflowRequest
  })
}

export function restartWorkflow(baseURL, workflowId) {
  return HTTPClient({
    method: 'post',
    baseURL,
    url: `/workflow/${workflowId}/restart`
  })
}

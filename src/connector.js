import url from 'url'
import HTTPClient from 'axios'

export function getWorkflowDefinition (baseURL, workflowName, version = '1') {
  let concatedUrl = url.resolve(baseURL, `/metadata/workflow/${workflowName}`)

  return HTTPClient({
    method: 'get',
    url: concatedUrl,
    params: {
      version: version
    }
  })
}

export function createWorkflowDef (baseURL, workflowDefBody) {
  let concatedUrl = url.resolve(baseURL, '/metadata/workflow')
  return HTTPClient({
    method: 'post',
    url: concatedUrl,
    data: workflowDefBody
  })
}

export function updateWorkflowDefs (baseURL, workflowDefsBody) {
  let concatedUrl = url.resolve(baseURL, '/metadata/workflow')
  return HTTPClient({
    method: 'put',
    url: concatedUrl,
    data: workflowDefsBody
  })
}

export function getAllWorkflowDefs (baseURL) {
  let concatedUrl = url.resolve(baseURL, '/metadata/workflow')
  return HTTPClient({
    method: 'get',
    url: concatedUrl
  })
}

export function unRegisterWorkflowDef (baseURL, workflowDefName, version = '1') {
  let concatedUrl = url.resolve(baseURL, `/metadata/workflow/${workflowDefName}/${version}`)

  return HTTPClient({
    method: 'delete',
    url: concatedUrl,
    params: {
      version: version
    }
  })
}

export function getTaskDef (baseURL, taskDefName) {
  let concatedUrl = url.resolve(baseURL, `/metadata/taskdefs/${taskDefName}`)

  return HTTPClient({
    method: 'get',
    url: concatedUrl
  })
}

export function registerTaskDefs (baseURL, taskDefsMeta) {
  let concatedUrl = url.resolve(baseURL, '/metadata/taskdefs')

  return HTTPClient({
    method: 'post',
    url: concatedUrl,
    data: taskDefsMeta
  })
}

export function updateTaskDef (baseURL, taskDefMeta) {
  let concatedUrl = url.resolve(baseURL, '/metadata/taskdefs')

  return HTTPClient({
    method: 'put',
    url: concatedUrl,
    data: taskDefMeta
  })
}

export function unRegisterTaskDef (baseURL, taskDefName) {
  let concatedUrl = url.resolve(baseURL, `/metadata/taskdefs/${taskDefName}`)

  return HTTPClient({
    method: 'delete',
    url: concatedUrl
  })
}

export function getAllTaskDefs (baseURL) {
  let concatedUrl = url.resolve(baseURL, '/metadata/taskdefs')

  return HTTPClient({
    method: 'get',
    url: concatedUrl
  })
}

/**********************/
/* Task Functions	  */
/**********************/

export function getTask (baseURL, taskID) {
  let concatedUrl = url.resolve(baseURL, `/tasks/${taskID}`)

  return HTTPClient({
    method: 'get',
    url: concatedUrl
  })
}

export function updateTask (baseURL, taskBody) {
  let concatedUrl = url.resolve(baseURL, '/tasks')

  return HTTPClient({
    method: 'get',
    url: concatedUrl,
    data: taskBody
  })
}

export function pollForTask (baseURL, taskType, workerID) {
  let concatedUrl = url.resolve(baseURL, `/tasks/poll/${taskType}`)

  return HTTPClient({
    method: 'get',
    url: concatedUrl,
    params: {
      workerid: workerID
    }
  })
}

export function ackTask (baseURL, taskType, workerID) {
  let concatedUrl = url.resolve(baseURL, `/tasks/${taskType}/ack`)

  return HTTPClient({
    method: 'post',
    url: concatedUrl,
    headers: {
      Accept: 'text/plain'
    },
    params: {
      workerid: workerID
    }
  })
}

export function getAllTasksInQueue (baseURL) {
  let concatedUrl = url.resolve(baseURL, '/tasks/queue/all')

  return HTTPClient({
    method: 'get',
    url: concatedUrl
  })
}

export function removeTaskFromQueue (baseURL, taskType, taskID) {
  let concatedUrl = url.resolve(baseURL, `/tasks/queue/${taskType}/${taskID}`)

  return HTTPClient({
    method: 'delete',
    url: concatedUrl
  })
}

export function getTaskQueueSizes (baseURL, taskNames) {
  let concatedUrl = url.resolve(baseURL, '/tasks/queue/sizes')

  return HTTPClient({
    method: 'post',
    url: concatedUrl,
    data: taskNames
  })
}

/**********************/
/* Workflow Functions */
/**********************/

export function getWorkflow (baseURL, workflowId, includeTasks) {
  let concatedUrl = url.resolve(baseURL, `/workflow/${workflowId}`)

  return HTTPClient({
    method: 'get',
    url: concatedUrl,
    params: {
      includeTasks: includeTasks ? 'true' : 'false'
    }
  })
}

export function getRunningWorkflows (baseURL, workflowName, version = '1', startTime, endTime) {
  let concatedUrl = url.resolve(baseURL, `/workflow/running/${workflowName}`)

  return HTTPClient({
    method: 'get',
    url: concatedUrl,
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

export function startWorkflow (baseURL, workflowName, version = '1', correlationId, inputJson = {}) {
  let concatedUrl = url.resolve(baseURL, `/workflow/${workflowName}`)
  let params = {version: version}
  if (correlationId) {
    params.correlationId = correlationId
  }
  return HTTPClient({
    method: 'post',
    url: concatedUrl,
    params: {
      version: version
    },
    data: inputJson
  })
}

export function terminateWorkflow (baseURL, workflowId, reason) {
  let concatedUrl = url.resolve(baseURL, `/workflow/${workflowId}`)
  let params = {}
  if (reason) {
    params.reason = reason
  }
  return HTTPClient({
    method: 'delete',
    url: concatedUrl,
    params: params
  })
}

export function pauseWorkflow (baseURL, workflowId) {
  let concatedUrl = url.resolve(baseURL, `/workflow/${workflowId}/pause`)
  return HTTPClient({
    method: 'put',
    url: concatedUrl
  })
}

export function resumeWorkflow (baseURL, workflowId) {
  let concatedUrl = url.resolve(baseURL, `/workflow/${workflowId}/resume`)
  return HTTPClient({
    method: 'put',
    url: concatedUrl
  })
}

export function skipTaskFromWorkflow (baseURL, workflowId, taskReferenceName, skipTaskRequestBody) {
  let concatedUrl = url.resolve(baseURL, `/workflow/${workflowId}/skiptask/${taskReferenceName}`)
  return HTTPClient({
    method: 'put',
    url: concatedUrl,
    data: skipTaskRequestBody
  })
}

export function rerunWorkflow (baseURL, workflowId, rerunWorkflowRequest = {}) {
  let concatedUrl = url.resolve(baseURL, `/workflow/${workflowId}/rerun`)
  return HTTPClient({
    method: 'post',
    url: concatedUrl,
    data: rerunWorkflowRequest
  })
}

export function restartWorkflow (baseURL, workflowId) {
  let concatedUrl = url.resolve(baseURL, `/workflow/${workflowId}/restart`)
  return HTTPClient({
    method: 'post',
    url: concatedUrl
  })
}

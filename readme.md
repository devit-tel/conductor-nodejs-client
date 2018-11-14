# conductor-client

### Install

```
npm i -s conductor-client
```

### Usage

```javascript
const ConductorClient = require('conductor-client').default

const conductorClient = new ConductorClient({ baseURL: 'http://localhost:8080/api' })

const workflowDefs = [
  {
    name: 'withdraw_chickens',
    description: 'Withdraw chickens',
    version: 1,
    tasks: [
      {
        name: 'is_take_home',
        taskReferenceName: 'is_take_home',
        type: 'DECISION',
        inputParameters: {
          orderType: '${workflow.input.orderType}'
        },
        caseValueParam: 'orderType',
        decisionCases: {
          takehome: [
            {
              name: 'put_chickens_on_box',
              taskReferenceName: 'put_chickens_on_box',
              inputParameters: {
                chickens: '${workflow.input.chickens}'
              },
              type: 'SIMPLE',
              startDelay: 0,
              optional: false
            }
          ]
        },
        defaultCase: [
          {
            name: 'withdraw_disk',
            taskReferenceName: 'withdraw_disk',
            type: 'SIMPLE',
            startDelay: 0,
            optional: false
          },
          {
            name: 'put_chickens_on_disk',
            taskReferenceName: 'put_chickens_on_disk',
            inputParameters: {
              chickens: '${workflow.input.chickens}'
            },
            type: 'SIMPLE',
            startDelay: 0,
            optional: false
          }
        ],
        startDelay: 0,
        optional: false
      }
    ],
    inputParameters: ['orderType', 'chickens', 'orderType'],
    schemaVersion: 2
  },
  {
    name: 'order_chickens',
    description: 'Order chickens',
    version: 1,
    tasks: [
      {
        name: 'get_money',
        taskReferenceName: 'get_money',
        inputParameters: {
          money: '${workflow.input.money}'
        },
        type: 'SIMPLE',
        startDelay: 0,
        optional: false
      },
      {
        name: 'print_slip',
        taskReferenceName: 'print_slip',
        inputParameters: {
          money: '${workflow.input.money}',
          chickens: '${workflow.input.chickens}',
          queueId: '${get_money.output.queueId}'
        },
        type: 'SIMPLE',
        startDelay: 0,
        optional: false
      },
      {
        name: 'check_chickens',
        taskReferenceName: 'check_chickens',
        inputParameters: {
          chickens: '${workflow.input.chickens}'
        },
        type: 'SIMPLE',
        startDelay: 0,
        optional: false
      },
      {
        name: 'is_got_chickens',
        taskReferenceName: 'is_got_chickens',
        type: 'DECISION',
        inputParameters: {
          isGotChickens: '${check_chickens.output.isGotChickens}'
        },
        caseValueParam: 'isGotChickens',
        decisionCases: {
          yes: [
            {
              name: 'withdraw_chickens',
              taskReferenceName: 'withdraw_chickens_yes',
              type: 'SUB_WORKFLOW',
              inputParameters: {
                orderType: '${workflow.input.orderType}',
                chickens: '${workflow.input.chickens}'
              },
              startDelay: 0,
              subWorkflowParam: {
                name: 'withdraw_chickens',
                version: 1
              },
              optional: false
            }
          ]
        },
        defaultCase: [
          {
            name: 'fire_chickens',
            taskReferenceName: 'fire_chickens',
            inputParameters: {
              chickens: '${workflow.input.chickens}'
            },
            type: 'SIMPLE',
            startDelay: 0,
            optional: false
          },
          {
            name: 'withdraw_chickens',
            taskReferenceName: 'withdraw_chickens_default',
            type: 'SUB_WORKFLOW',
            inputParameters: {
              orderType: '${workflow.input.orderType}',
              chickens: '${workflow.input.chickens}'
            },
            startDelay: 0,
            subWorkflowParam: {
              name: 'withdraw_chickens',
              version: 1
            },
            optional: false
          }
        ],
        startDelay: 0,
        optional: false
      },
      {
        name: 'put_chickens_on_counter',
        taskReferenceName: 'put_chickens_on_counter',
        type: 'SIMPLE',
        startDelay: 0,
        optional: false
      },
      {
        name: 'call_customer',
        taskReferenceName: 'call_customer',
        inputParameters: {
          queueId: '${get_money.output.queueId}'
        },
        type: 'SIMPLE',
        startDelay: 0,
        optional: false
      },
      {
        name: 'others_job',
        taskReferenceName: 'others_job',
        inputParameters: {
          dynamicTasks: '${call_customer.output.dynamicTasks}',
          dynamicTasksInput: '${call_customer.output.dynamicTasksInput}'
        },
        type: 'FORK_JOIN_DYNAMIC',
        dynamicForkTasksParam: 'dynamicTasks',
        dynamicForkTasksInputParamName: 'dynamicTasksInput'
      },
      {
        joinOn: ['others_job'],
        taskReferenceName: 'system_join',
        type: 'JOIN'
      },
      {
        name: 'just_done',
        taskReferenceName: 'just_done',
        type: 'SIMPLE',
        startDelay: 0,
        optional: false
      }
    ],
    inputParameters: ['orderType', 'chickens', 'money'],
    schemaVersion: 2
  }
]

const taskDefs = [
  {
    name: 'get_money',
    retryCount: 3,
    timeoutSeconds: 3600,
    inputKeys: ['money'],
    outputKeys: ['queueId'],
    timeoutPolicy: 'TIME_OUT_WF',
    retryLogic: 'FIXED',
    retryDelaySeconds: 60,
    responseTimeoutSeconds: 3600
  },
  {
    name: 'print_slip',
    retryCount: 3,
    timeoutSeconds: 3600,
    inputKeys: ['money', 'queueId', 'chickens'],
    outputKeys: [],
    timeoutPolicy: 'TIME_OUT_WF',
    retryLogic: 'FIXED',
    retryDelaySeconds: 60,
    responseTimeoutSeconds: 3600
  },
  {
    name: 'check_chickens',
    retryCount: 3,
    timeoutSeconds: 3600,
    inputKeys: ['chickens'],
    outputKeys: ['isGotChickens'],
    timeoutPolicy: 'TIME_OUT_WF',
    retryLogic: 'FIXED',
    retryDelaySeconds: 60,
    responseTimeoutSeconds: 3600
  },
  {
    name: 'is_got_chickens',
    retryCount: 3,
    timeoutSeconds: 3600,
    inputKeys: ['chickens'],
    outputKeys: [],
    timeoutPolicy: 'TIME_OUT_WF',
    retryLogic: 'FIXED',
    retryDelaySeconds: 60,
    responseTimeoutSeconds: 3600
  },
  {
    name: 'fire_chickens',
    retryCount: 3,
    timeoutSeconds: 3600,
    inputKeys: ['chickens'],
    outputKeys: [],
    timeoutPolicy: 'TIME_OUT_WF',
    retryLogic: 'FIXED',
    retryDelaySeconds: 60,
    responseTimeoutSeconds: 3600
  },
  {
    name: 'put_chickens_on_counter',
    retryCount: 3,
    timeoutSeconds: 3600,
    inputKeys: [],
    outputKeys: [],
    timeoutPolicy: 'TIME_OUT_WF',
    retryLogic: 'FIXED',
    retryDelaySeconds: 60,
    responseTimeoutSeconds: 3600
  },
  {
    name: 'call_customer',
    retryCount: 3,
    timeoutSeconds: 3600,
    inputKeys: ['queueId'],
    outputKeys: [],
    timeoutPolicy: 'TIME_OUT_WF',
    retryLogic: 'FIXED',
    retryDelaySeconds: 60,
    responseTimeoutSeconds: 3600
  },
  {
    name: 'is_take_home',
    retryCount: 3,
    timeoutSeconds: 3600,
    inputKeys: ['order_type'],
    outputKeys: [],
    timeoutPolicy: 'TIME_OUT_WF',
    retryLogic: 'FIXED',
    retryDelaySeconds: 60,
    responseTimeoutSeconds: 3600
  },
  {
    name: 'withdraw_disk',
    retryCount: 3,
    timeoutSeconds: 3600,
    inputKeys: [],
    outputKeys: [],
    timeoutPolicy: 'TIME_OUT_WF',
    retryLogic: 'FIXED',
    retryDelaySeconds: 60,
    responseTimeoutSeconds: 3600
  },
  {
    name: 'put_chickens_on_disk',
    retryCount: 3,
    timeoutSeconds: 3600,
    inputKeys: [],
    outputKeys: [],
    timeoutPolicy: 'TIME_OUT_WF',
    retryLogic: 'FIXED',
    retryDelaySeconds: 60,
    responseTimeoutSeconds: 3600
  },
  {
    name: 'put_chickens_on_box',
    retryCount: 3,
    timeoutSeconds: 3600,
    inputKeys: [],
    outputKeys: [],
    timeoutPolicy: 'TIME_OUT_WF',
    retryLogic: 'FIXED',
    retryDelaySeconds: 60,
    responseTimeoutSeconds: 3600
  },
  {
    name: 'just_wait',
    retryCount: 3,
    timeoutSeconds: 3600,
    inputKeys: [],
    outputKeys: [],
    timeoutPolicy: 'TIME_OUT_WF',
    retryLogic: 'FIXED',
    retryDelaySeconds: 60,
    responseTimeoutSeconds: 3600
  },
  {
    name: 'dy_fork_1',
    retryCount: 3,
    timeoutSeconds: 3600,
    inputKeys: [],
    outputKeys: [],
    timeoutPolicy: 'TIME_OUT_WF',
    retryLogic: 'FIXED',
    retryDelaySeconds: 60,
    responseTimeoutSeconds: 3600
  },
  {
    name: 'dy_fork_2',
    retryCount: 3,
    timeoutSeconds: 3600,
    inputKeys: [],
    outputKeys: [],
    timeoutPolicy: 'TIME_OUT_WF',
    retryLogic: 'FIXED',
    retryDelaySeconds: 60,
    responseTimeoutSeconds: 3600
  },
  {
    name: 'dy_fork_3',
    retryCount: 3,
    timeoutSeconds: 3600,
    inputKeys: [],
    outputKeys: [],
    timeoutPolicy: 'TIME_OUT_WF',
    retryLogic: 'FIXED',
    retryDelaySeconds: 60,
    responseTimeoutSeconds: 3600
  },
  {
    name: 'dy_fork_4',
    retryCount: 3,
    timeoutSeconds: 3600,
    inputKeys: [],
    outputKeys: [],
    timeoutPolicy: 'TIME_OUT_WF',
    retryLogic: 'FIXED',
    retryDelaySeconds: 60,
    responseTimeoutSeconds: 3600
  },
  {
    name: 'just_done',
    retryCount: 3,
    timeoutSeconds: 3600,
    inputKeys: [],
    outputKeys: [],
    timeoutPolicy: 'TIME_OUT_WF',
    retryLogic: 'FIXED',
    retryDelaySeconds: 60,
    responseTimeoutSeconds: 3600
  }
]

conductorClient.updateWorkflowDefs(workflowDefs).then(() =>
  conductorClient.registerTaskDefs(taskDefs).then(() => {
    conductorClient.registerWatcher(
      'get_money',
      (data, updater) => {
        console.log(data.taskType, data.inputData)
        updater({ status: 'COMPLETED', outputData: { queueId: '12354423' } })
      },
      { pollingIntervals: 1000, autoAck: true, maxRunner: 1 },
      true
    )
    conductorClient.registerWatcher(
      'print_slip',
      (data, updater) => {
        console.log(data.taskType, data.inputData)
        updater({ status: 'COMPLETED' })
      },
      { pollingIntervals: 1000, autoAck: true, maxRunner: 1 },
      true
    )
    conductorClient.registerWatcher(
      'check_chickens',
      (data, updater) => {
        console.log(data.taskType, data.inputData)
        updater({ status: 'COMPLETED', outputData: { isGotChickens: 'yes' } })
      },
      { pollingIntervals: 1000, autoAck: true, maxRunner: 1 },
      true
    )
    conductorClient.registerWatcher(
      'fire_chickens',
      (data, updater) => {
        console.log(data.taskType, data.inputData)
        updater({ status: 'COMPLETED' })
      },
      { pollingIntervals: 1000, autoAck: true, maxRunner: 1 },
      true
    )
    conductorClient.registerWatcher(
      'put_chickens_on_counter',
      (data, updater) => {
        console.log(data.taskType, data.inputData)
        updater({ status: 'COMPLETED' })
      },
      { pollingIntervals: 1000, autoAck: true, maxRunner: 1 },
      true
    )
    conductorClient.registerWatcher(
      'call_customer',
      (data, updater) => {
        const forkTasks = [
          { name: 'dy_fork_1', taskReferenceName: 'dy_fork_1', type: 'SIMPLE' },
          { name: 'dy_fork_2', taskReferenceName: 'dy_fork_2', type: 'SIMPLE' },
          { name: 'dy_fork_3', taskReferenceName: 'dy_fork_3', type: 'SIMPLE' },
          { name: 'dy_fork_4', taskReferenceName: 'dy_fork_4', type: 'SIMPLE' }
        ]
        const inputTasks = {
          dy_fork_1: { input1: 'Hello1' },
          dy_fork_2: { input2: 'Hello2' },
          dy_fork_3: { input1: '33223' },
          dy_fork_4: { input1: 'Hello4' }
        }
        console.log(data.taskType, data.inputData)
        updater({
          status: 'COMPLETED',
          outputData: { dynamicTasks: forkTasks, dynamicTasksInput: inputTasks }
        })
      },
      { pollingIntervals: 1000, autoAck: true, maxRunner: 1 },
      true
    )
    conductorClient.registerWatcher(
      'withdraw_disk',
      (data, updater) => {
        console.log(data.taskType, data.inputData)
        updater({ status: 'COMPLETED' })
      },
      { pollingIntervals: 1000, autoAck: true, maxRunner: 1 },
      true
    )
    conductorClient.registerWatcher(
      'put_chickens_on_disk',
      (data, updater) => {
        console.log(data.taskType, data.inputData)
        updater({ status: 'COMPLETED' })
      },
      { pollingIntervals: 1000, autoAck: true, maxRunner: 1 },
      true
    )
    conductorClient.registerWatcher(
      'put_chickens_on_box',
      (data, updater) => {
        console.log(data.taskType, data.inputData)
        updater({ status: 'COMPLETED' })
      },
      { pollingIntervals: 1000, autoAck: true, maxRunner: 1 },
      true
    )
    conductorClient.registerWatcher(
      'just_wait',
      (data, updater) => {
        console.log(data.taskType, data.inputData)
        updater({ status: 'COMPLETED' })
      },
      { pollingIntervals: 1000, autoAck: true, maxRunner: 1 },
      true
    )
    conductorClient.registerWatcher(
      'dy_fork_1',
      (data, updater) => {
        console.log(data.taskType, data.inputData)
        updater({ status: 'COMPLETED' })
      },
      { pollingIntervals: 1000, autoAck: true, maxRunner: 1 },
      true
    )
    conductorClient.registerWatcher(
      'dy_fork_2',
      (data, updater) => {
        console.log(data.taskType, data.inputData)
        updater({ status: 'COMPLETED' })
      },
      { pollingIntervals: 1000, autoAck: true, maxRunner: 1 },
      true
    )
    conductorClient.registerWatcher(
      'dy_fork_3',
      (data, updater) => {
        console.log(data.taskType, data.inputData)
        updater({ status: 'COMPLETED' })
      },
      { pollingIntervals: 1000, autoAck: true, maxRunner: 1 },
      true
    )
    conductorClient.registerWatcher(
      'dy_fork_4',
      (data, updater) => {
        console.log(data.taskType, data.inputData)
        updater({ status: 'COMPLETED' })
      },
      { pollingIntervals: 1000, autoAck: true, maxRunner: 1 },
      true
    )

    conductorClient.registerWatcher(
      'just_done',
      (data, updater) => {
        console.log(data.taskType, data.inputData)
        updater({ status: 'COMPLETED' })
      },
      { pollingIntervals: 1000, autoAck: true, maxRunner: 1 },
      true
    )
    conductorClient.startWorkflow('order_chickens', {
      money: 500,
      orderType: 'takehome',
      chickens: 20,
      task2Name: 'task_5'
    })
  })
)
```

### ConductorClient's method

- registerWatcher(taskType, callback = f => f, options = {}, startPolling = false)
  -- Description
  --- register a watcher to polling for task
  -- Arguments
  --- taskType (String): taskType to register
  --- callback (Function(data, updater(data))): callback function that fired if found task
  --- options (Object): see below, options to overide client options
  --- startPolling (Boolean): if set to true, watcher will start polling right away
  -- Returns
  -- worker (Worker's Object): worker object

- startPolling()
  -- Description
  --- If set startPolling to false on registerWatcher can call this method to let all workers start polling

- getWorkflowDefinition(workflowName: string, varsion: number = 1)
  -- Description
  --- get workflow by workflowName

- getAllWorkflowDefs()

- createWorkflowDef(workflowDefBody)

- updateWorkflowDefs(workflowDefsBody = [])

- unRegisterWorkflowDef(workflowDefName, version = 1)

- getTaskDef(taskDefName)

- getAllTaskDefs()

- registerTaskDefs(taskDefsMeta = [])

- updateTaskDef(taskDefMeta)

- unRegisterTaskDef(taskDefName)

- getWorkflow(workflowId, includeTasks = true)

- searchWorkflows(start = 0, size = 20, sort = 'ASC:createTime', freeText, query)

- getRunningWorkflows(workflowName, version = '1')

- startWorkflow(workflowName, input, version = 1, correlationId)

- restartWorkflow(workflowId)

- terminateWorkflow(workflowId, reason = '')

- pauseWorkflow(workflowId)

- resumeWorkflow(workflowId)

- skipTaskFromWorkflow(workflowId, taskReferenceName, taskInput, taskOutput)

- rerunWorkflow(workflowId, reRunFromWorkflowId, workflowInput = {}, reRunFromTaskId, taskInput = {})

### ConductorClient's options

ConductorClient options will pass to watcher's options as default value and can overide per each worker by using registerWatcher
| property | default value | type | description |
|------------------|---------------------------------------------------|---------|---------------------------------------|
| baseURL | http://localhost:8080/api | String | base url of conductor server |
| workerID | computer's hostname e.g. someone's-computer.local | String | unique worker ID |
| pollingIntervals | 1000 | Number | polling interval in millisecond |
| maxRunner | 1 | Number | Nummber of running tasks per taskType |
| autoAck | true | Boolean | Auto send ack when poll a task |

### watcher's option

The same as ConductorClient options but this option will overided
| property | default value | type | description |
|------------------|---------------------------------------------------|---------|---------------------------------------|
| baseURL | http://localhost:8080/api | String | base url of conductor server |
| workerID | computer's hostname e.g. someone's-computer.local | String | unique worker ID |
| pollingIntervals | 1000 | Number | polling interval in millisecond |
| maxRunner | 1 | Number | Nummber of running tasks per taskType |
| autoAck | true | Boolean | Auto send ack when poll a task |

import ConductorClient from './index.js'

// registerWatcher('./src/helper/watcher', { baseURL: BASE_URL, taskType: 'get_money' })

const conductorClient = new ConductorClient({ baseURL: 'http://localhost:8080/api' })

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
    updater({ status: 'COMPLETED' })
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

import ConductorClient from './index.js'

// registerWatcher('./src/helper/watcher', { baseURL: BASE_URL, taskType: 'get_money' })

const conductorClient = new ConductorClient({ baseURL: 'http://localhost:8080/api' })

conductorClient.registerWatcher(
  'get_money',
  data => console.log(data.taskId),
  { pollingIntervals: 1000, autoAck: true, maxRunner: 1 },
  true
)

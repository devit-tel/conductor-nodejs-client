import {registerWatcher} from './index.js'

const BASE_URL = 'http://localhost:8080'

registerWatcher('./src/watcher', {baseURL: BASE_URL, taskType: 'task_1'})

import {registerWatcher} from './index.js'

const BASE_URL = 'http://localhost:8080/api'

registerWatcher('./src/helper/watcher', {baseURL: BASE_URL, taskType: 'get_money'})

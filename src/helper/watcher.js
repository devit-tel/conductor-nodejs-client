import {pollForTask} from './connector'

const MESSAGE_TYPE = {
  REGISTER_TASK: 'REGISTER_TASK'
}

function sleep (n) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, n)
}

async function startPolling (baseURL, taskType, workerID) {
  let {response} = await pollForTask(baseURL, taskType, workerID)
  console.log(response.data)
}

process.on('message', async function (message) {
  console.log(message.options.baseURL)
  if (message.type === MESSAGE_TYPE.REGISTER_TASK) {
    const {options} = message
    while (true) {
      try {
        await startPolling(options.baseURL, options.taskType, options.workerID)
      } catch (e) {
        console.error(e)
        process.exit(1)
      }
      sleep(options.pollingTime * 1000)
    }
  }
})

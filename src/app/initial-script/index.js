import setConfig from './set-config'

let once = false

export default function () {
  if (once) {
    return
  }
  once = true
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve) => {
    await setConfig()
    resolve()
  })
}

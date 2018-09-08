const zigbee = require('../zigbee')
const sleep = require('./sleep')
const isDeviceRouter = require('./isDeviceRouter')

const DEFAULT_POLL_INTERVAL = 60 * 1000

class RouterPolling {
  constructor() {
    this.log = () => {}
    this.pollingInterval = null
  }

  parseInterval(interval) {
    return (interval && interval >= 15)
      ? interval * 1000
      : DEFAULT_POLL_INTERVAL
  }

  start(interval) {
    this.stop()
    this.pollingInterval = setInterval(() => {
      const devices = zigbee.list().filter(isDeviceRouter)
      devices.reduce((promise, device) => promise.then(() => {
        this.log(`[RouterPolling] ping device: ${device.ieeeAddr}`)
        zigbee.ping(device.ieeeAddr)
        return sleep(1000)
      }), Promise.resolve())
    }, this.parseInterval(interval))
  }

  stop() {
    clearInterval(this.pollingInterval)
    this.pollingInterval = null
  }
}

// This is singleton
module.exports = new RouterPolling()

const zigbee = require('../zigbee')
const sleep = require('./sleep')

const POLL_INTERVAL = 30 * 1000

let pollDevicesInterval = null

function isDeviceRouter(device) {
  let power = 'unknown'
  if (device.powerSource) {
    power = device.powerSource.toLowerCase().split(' ')[0]
  }
  if (power !== 'battery'
    && power !== 'unknown'
    && device.type === 'Router'
  ) {
    return true
  }
}

// Some routers need polling to prevent them from sleeping.
module.exports = function pollDevices(start, log = () => {}) {
  if (start && !pollDevicesInterval) {
    pollDevicesInterval = setInterval(() => {
      const devices = zigbee.list().filter(isDeviceRouter)
      devices.reduce((promise, device) => promise.then(() => {
        log(`Polling router device: ${device.ieeeAddr}`)
        zigbee.ping(device.ieeeAddr)
        return sleep(1000)
      }), Promise.resolve())
    }, POLL_INTERVAL)
  } else if (!start && pollDevicesInterval) {
    clearInterval(pollDevicesInterval)
    pollDevicesInterval = null
  }
}

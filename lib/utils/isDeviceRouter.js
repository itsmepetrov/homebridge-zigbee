module.exports = function isDeviceRouter(device) {
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

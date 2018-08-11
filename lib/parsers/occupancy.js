const ALARM_MOTION_RESET_WINDOW = 180 // Should be configurable outside

module.exports = {
  report: 'occupancy',
  reportParser: (data, device, characteristic) => {
    // Set and clear motion timeout
    clearTimeout(device.motionTimeout)
    device.motionTimeout = setTimeout(() => {
      // Reset characteristic
      characteristic.updateValue(false)
    }, ALARM_MOTION_RESET_WINDOW * 1000)
    // Update characteristic
    return data === 1
  },
  get: 'occupancy',
  getParser: data => data === 1,
}

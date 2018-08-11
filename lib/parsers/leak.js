module.exports = {
  status: 'zoneStatus',
  statusParser: (data, device) => data === 1
    ? device.Characteristic.LeakDetected.LEAK_DETECTED
    : device.Characteristic.LeakDetected.LEAK_NOT_DETECTED,
}

const parseValue = (data, device) => data === 0
  ? device.Characteristic.ContactSensorState.CONTACT_DETECTED
  : device.Characteristic.ContactSensorState.CONTACT_NOT_DETECTED

module.exports = {
  report: 'onOff',
  reportParser: parseValue,
  get: 'onOff',
  getParser: parseValue,
}
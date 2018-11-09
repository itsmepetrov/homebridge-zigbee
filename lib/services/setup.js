function createService(device, name) {
  return new device.Service.Setup(device.parseServiceName(name))
}

function mount(device) {
  // Unpair Device Characteristic
  const unpairDevice = device.getServiceCharacteristic('Setup', 'SetupUnpairDevice')
  unpairDevice.on('set', (value, callback) => {
    device.platform.unpairDevice(device).then(callback)
  })
  unpairDevice.on('get', (callback) => {
    callback(null, false)
  })
}

module.exports = {
  createService,
  mount,
}

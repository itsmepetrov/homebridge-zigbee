const HomeKitDevice = require('../HomeKitDevice')
const { XIAOMI_STRUCT_ATTR, updateXiaomiButteryCharacteristics } = require('../utils/xiaomi')

class AqaraDoorWindowSensor extends HomeKitDevice {
  constructor(data) {
    super({ model: 'lumi.sensor_magnet.aq2', manufacturer: 'Aqara', ...data })
  }

  getAvailbleServices() {
    return [{
      name: 'Contact',
      type: this.Service.ContactSensor,
    }, {
      name: 'Battery',
      type: this.Service.BatteryService,
    }]
  }

  onDeviceReady() {
    this.zigbee.update({ status: 'online', joinTime: Math.floor(Date.now() / 1000) })
    this.zigbee.subscribe(1, 'genOnOff', 'onOff', 1, 3600, 1, this.handleContactReport.bind(this))
    this.zigbee.subscribe(1, 'genBasic', XIAOMI_STRUCT_ATTR, 1, 60, null, this.handleLifelineReport.bind(this))
  }

  handleContactReport(data) {
    const characteristic = this.getServiceCharacteristic('Contact', this.Characteristic.ContactSensorState)
    const value = data === 0
      ? this.Characteristic.ContactSensorState.CONTACT_DETECTED
      : this.Characteristic.ContactSensorState.CONTACT_NOT_DETECTED
    characteristic.updateValue(value)
  }

  handleLifelineReport(data) {
    updateXiaomiButteryCharacteristics(this, data)
  }
}

module.exports = AqaraDoorWindowSensor

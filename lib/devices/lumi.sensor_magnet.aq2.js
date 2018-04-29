const HomeKitDevice = require('../HomeKitDevice')
const { mountXiaomiButteryCharacteristics } = require('../utils/xiaomi')

class AqaraDoorWindowSensor extends HomeKitDevice {
  static description() {
    return {
      model: 'lumi.sensor_magnet.aq2',
      manufacturer: 'LUMI',
    }
  }

  getAvailbleServices() {
    return [{
      name: 'Contact',
      type: 'ContactSensor',
    }, {
      name: 'Battery',
      type: 'BatteryService',
    }]
  }

  onDeviceReady() {
    this.zigbee.update({ status: 'online', joinTime: Math.floor(Date.now() / 1000) })
    this.mountServiceCharacteristic({
      endpoint: 1,
      cluster: 'genOnOff',
      service: 'Contact',
      characteristic: 'ContactSensorState',
      reportMinInt: 1,
      reportMaxInt: 3600,
      reportChange: 1,
      parser: 'contact',
      get: null, // read doesn't work, why?
    })
    mountXiaomiButteryCharacteristics(this, {
      reportMinInt: 1,
      reportMaxInt: 60,
    })
  }

  contactValueParser(data) {
    return data === 0
      ? this.Characteristic.ContactSensorState.CONTACT_DETECTED
      : this.Characteristic.ContactSensorState.CONTACT_NOT_DETECTED
  }
}

module.exports = AqaraDoorWindowSensor

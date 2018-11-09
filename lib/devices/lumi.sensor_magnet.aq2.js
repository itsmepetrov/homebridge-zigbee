const HomeKitDevice = require('../HomeKitDevice')
const { mountXiaomiButteryCharacteristics } = require('../utils/xiaomi')

class AqaraDoorWindowSensor extends HomeKitDevice {
  static get description() {
    return {
      model: 'lumi.sensor_magnet.aq2',
      manufacturer: 'LUMI',
      name: 'Aqara Door Window Sensor',
    }
  }

  getAvailbleServices() {
    return [{
      name: 'Contact',
      type: 'ContactSensor',
      history: {
        type: 'door',
        use: 'status',
      },
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
      get: null,
    })
    mountXiaomiButteryCharacteristics(this, {
      reportMinInt: 1,
      reportMaxInt: 60,
    })
  }
}

module.exports = AqaraDoorWindowSensor

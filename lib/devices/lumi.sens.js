const HomeKitDevice = require('../HomeKitDevice')
const { mountXiaomiButteryCharacteristics } = require('../utils/xiaomi')

class XiaomiTempSensor extends HomeKitDevice {
  static get description() {
    return {
      model: 'lumi.sens',
      manufacturer: 'LUMI',
      name: 'Xiaomi Temperature Sensor',
    }
  }

  getAvailbleServices() {
    return [{
      name: 'Temperature',
      type: 'TemperatureSensor',
      history: {
        type: 'weather',
        use: 'temp',
      },
    }, {
      name: 'Humidity',
      type: 'HumiditySensor',
      history: {
        type: 'weather',
        use: 'humidity',
      },
    }, {
      name: 'Battery',
      type: 'BatteryService',
    }]
  }

  onDeviceReady() {
    this.zigbee.update({ status: 'online', joinTime: Math.floor(Date.now() / 1000) })
    this.getServiceCharacteristic(
      'Temperature', 'CurrentTemperature'
    ).setProps({ maxValue: 80, minValue: -40 })
    this.mountServiceCharacteristic({
      endpoint: 1,
      cluster: 'msTemperatureMeasurement',
      service: 'Temperature',
      characteristic: 'CurrentTemperature',
      reportMinInt: 60,
      reportMaxInt: 1,
      reportChange: 1,
      parser: 'temperature',
      get: null,
    })
    this.mountServiceCharacteristic({
      endpoint: 1,
      cluster: 'msRelativeHumidity',
      service: 'Humidity',
      characteristic: 'CurrentRelativeHumidity',
      reportMinInt: 60,
      reportMaxInt: 1,
      reportChange: 1,
      parser: 'humidity',
      get: null,
    })
    mountXiaomiButteryCharacteristics(this, {
      reportMinInt: 1,
      reportMaxInt: 60,
    })
  }
}

module.exports = XiaomiTempSensor

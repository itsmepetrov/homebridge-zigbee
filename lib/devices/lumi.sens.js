const HomeKitDevice = require('../HomeKitDevice')
const { mountXiaomiButteryCharacteristics } = require('../utils/xiaomi')

class XiaomiTempSensor extends HomeKitDevice {
  static description() {
    return {
      model: 'lumi.sens',
      manufacturer: 'LUMI',
    }
  }

  getAvailbleServices() {
    return [{
      name: 'Temperature',
      type: 'TemperatureSensor',
    }, {
      name: 'Humidity',
      type: 'HumiditySensor',
    }, {
      name: 'Battery',
      type: 'BatteryService',
    }]
  }

  onDeviceReady() {
    this.zigbee.update({ status: 'online', joinTime: Math.floor(Date.now() / 1000) })
    this.getServiceCharacteristic('Temperature', 'CurrentTemperature').setProps({ maxValue: 80, minValue: -40 })
    this.mountServiceCharacteristic({
      endpoint: 1,
      cluster: 'msTemperatureMeasurement',
      service: 'Temperature',
      characteristic: 'CurrentTemperature',
      reportMinInt: 60,
      reportMaxInt: 1,
      reportChange: 1,
      parser: 'temperature',
      get: null, // read doesn't work, why?
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
      get: null, // read doesn't work, why?
    })
    mountXiaomiButteryCharacteristics(this, {
      reportMinInt: 1,
      reportMaxInt: 60,
    })
  }
}

module.exports = XiaomiTempSensor

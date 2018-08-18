const HomeKitDevice = require('../HomeKitDevice')
const { /* XIAOMI_PRESSURE_ATTR, */ mountXiaomiButteryCharacteristics } = require('../utils/xiaomi')

class AqaraWeatherSensor extends HomeKitDevice {
  static get description() {
    return {
      model: 'lumi.weather',
      manufacturer: 'LUMI',
      name: 'Aqara Weather Sensor',
    }
  }

  getAvailbleServices() {
    return [{
      name: 'Temperature',
      type: 'TemperatureSensor',
    }, {
      name: 'Humidity',
      type: 'HumiditySensor',
    }, /* {
      name: 'Pressure',
      type: ???
    }, */ {
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
      reportMaxInt: 0,
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
      reportMaxInt: 0,
      reportChange: 1,
      parser: 'humidity',
      get: null,
    })
    // this.mountServiceCharacteristic({
    //   endpoint: 1,
    //   cluster: 'msPressureMeasurement',
    //   service: 'Pressure',
    //   characteristic: '???',
    //   reportMinInt: 60,
    //   reportMaxInt: 0,
    //   reportChange: 1,
    //   parser: 'humidity',
    //   report: XIAOMI_PRESSURE_ATTR,
    //   get: null, // read doesn't work, why?
    // })
    mountXiaomiButteryCharacteristics(this, {
      reportMinInt: 1,
      reportMaxInt: 60,
    })
  }
}

module.exports = AqaraWeatherSensor

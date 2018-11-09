const HomeKitDevice = require('../HomeKitDevice')
const { mountXiaomiButteryCharacteristics } = require('../utils/xiaomi')

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
      name: 'Pressure',
      type: 'EveAirPressureSensor',
      history: {
        type: 'weather',
        use: 'pressure',
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
    this.mountServiceCharacteristic({
      endpoint: 1,
      cluster: 'msPressureMeasurement',
      service: 'Pressure',
      characteristic: 'EveAirPressure',
      reportMinInt: 60,
      reportMaxInt: 0,
      reportChange: 1,
      parser: 'pressure',
      get: null,
    })
    mountXiaomiButteryCharacteristics(this, {
      reportMinInt: 1,
      reportMaxInt: 60,
    })
  }
}

module.exports = AqaraWeatherSensor

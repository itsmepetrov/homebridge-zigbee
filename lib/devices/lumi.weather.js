const HomeKitDevice = require('../HomeKitDevice')
const { XIAOMI_STRUCT_ATTR, XIAOMI_PRESSURE_ATTR, updateXiaomiButteryCharacteristics } = require('../utils/xiaomi')

class AqaraWeatherSensor extends HomeKitDevice {
  constructor(data) {
    super({ model: 'lumi.weather', manufacturer: 'Aqara', ...data })
  }

  getAvailbleServices() {
    return [{
      name: 'Temperature',
      type: this.Service.TemperatureSensor,
    }, {
      name: 'Humidity',
      type: this.Service.HumiditySensor,
    }, /* {
      name: 'Pressure',
      type: ???
    }, */ {
      name: 'Battery',
      type: this.Service.BatteryService,
    }]
  }

  onDeviceReady() {
    this.zigbee.update({ status: 'online', joinTime: Math.floor(Date.now() / 1000) })
    this.zigbee.subscribe(1, 'msTemperatureMeasurement', 'measuredValue', 60, 0, 1, this.handleTemperatureReport.bind(this))
    this.zigbee.subscribe(1, 'msRelativeHumidity', 'measuredValue', 60, 0, 1, this.handleHumidityReport.bind(this))
    this.zigbee.subscribe(1, 'msPressureMeasurement', XIAOMI_PRESSURE_ATTR, 60, 0, 1, this.handlePressureReport.bind(this))
    this.zigbee.subscribe(1, 'genBasic', XIAOMI_STRUCT_ATTR, 1, 60, null, this.handleLifelineReport.bind(this))
  }

  handleTemperatureReport(data) {
    const characteristic = this.getServiceCharacteristic('Temperature', this.Characteristic.CurrentTemperature)
    characteristic.setProps({ maxValue: 80, minValue: -40 })
    characteristic.updateValue(Math.round((data / 100) * 10) / 10)
  }

  handleHumidityReport(data) {
    const characteristic = this.getServiceCharacteristic('Humidity', this.Characteristic.CurrentRelativeHumidity)
    characteristic.updateValue(Math.round((data / 100) * 10) / 10)
  }

  handlePressureReport(data) {
    // const characteristic = this.getServiceCharacteristic('Pressure', this.Characteristic.CurrentRelativeHumidity)
    // characteristic.updateValue(Math.round((data / 100) * 10) / 10)
  }

  handleLifelineReport(data) {
    updateXiaomiButteryCharacteristics(this, data)
  }
}

module.exports = AqaraWeatherSensor

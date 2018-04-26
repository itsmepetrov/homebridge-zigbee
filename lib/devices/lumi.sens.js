const HomeKitDevice = require('../HomeKitDevice')
const { XIAOMI_STRUCT_ATTR, updateXiaomiButteryCharacteristics } = require('../utils/xiaomi')

class XiaomiTempSensor extends HomeKitDevice {
  constructor(data) {
    super({ model: 'lumi.sens', manufacturer: 'Xiaomi', ...data })
  }

  getAvailbleServices() {
    return [{
      name: 'Temperature',
      type: this.Service.TemperatureSensor,
    }, {
      name: 'Humidity',
      type: this.Service.HumiditySensor,
    }, {
      name: 'Battery',
      type: this.Service.BatteryService,
    }]
  }

  onDeviceReady() {
    this.zigbee.update({ status: 'online', joinTime: Math.floor(Date.now() / 1000) })
    this.zigbee.subscribe(1, 'msTemperatureMeasurement', 'measuredValue', 60, 1, 1, this.handleTemperatureReport.bind(this))
    this.zigbee.subscribe(1, 'msRelativeHumidity', 'measuredValue', 60, 1, 1, this.handleHumidityReport.bind(this))
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

  handleLifelineReport(data) {
    updateXiaomiButteryCharacteristics(this, data)
  }
}

module.exports = XiaomiTempSensor

const ZigBeeDevice = require('../ZigBeeDevice')
const { parseXiaomiBatteryInfo, XIAOMI_STRUCT_ATTR } = require('../utils/xiaomi')

class XiaomiTempSensor extends ZigBeeDevice {
  ready() {
    this.update({ status: 'online', joinTime: Math.floor(Date.now() / 1000) })

    this.subscribe(1, 'msTemperatureMeasurement', 'measuredValue', 1, 60, 1, this.handleTemperatureReport.bind(this))
    this.subscribe(1, 'msRelativeHumidity', 'measuredValue', 1, 60, 1, this.handleHumidityReport.bind(this))
    this.subscribe(1, 'genBasic', XIAOMI_STRUCT_ATTR, 1, 60, null, this.handleLifelineReport.bind(this))
  }

  handleTemperatureReport(data) {
    this.log('handleTemperatureReport:', data)
  }

  handleHumidityReport(data) {
    this.log('handleHumidityReport:', data)
  }

  handleLifelineReport(data) {
    this.log('handleLifelineReport:', parseXiaomiBatteryInfo(data))
  }
}

module.exports = XiaomiTempSensor

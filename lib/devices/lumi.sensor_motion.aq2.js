const ZigBeeDevice = require('../ZigBeeDevice')
const { parseXiaomiBatteryInfo, XIAOMI_STRUCT_ATTR } = require('../utils/xiaomi')

class AqaraHumanBodySensor extends ZigBeeDevice {
  ready() {
    this.update({ status: 'online', joinTime: Math.floor(Date.now() / 1000) })

    this.subscribe(1, 'msOccupancySensing', 'occupancy', 1, 60, 1, this.handleOccupancyReport.bind(this))
    this.subscribe(1, 'msIlluminanceMeasurement', 'measuredValue', 1, 60, 1, this.handleIlluminanceReport.bind(this))
    this.subscribe(1, 'genBasic', XIAOMI_STRUCT_ATTR, 1, 60, null, this.handleLifelineReport.bind(this))
  }

  handleOccupancyReport(data) {
    this.log('handleOccupancyReport:', data)
  }

  handleIlluminanceReport(data) {
    this.log('handleIlluminanceReport:', data)
  }

  handleLifelineReport(data) {
    this.log('handleLifelineReport:', parseXiaomiBatteryInfo(data))
  }
}

module.exports = AqaraHumanBodySensor

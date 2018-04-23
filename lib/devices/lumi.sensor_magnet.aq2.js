const ZigBeeDevice = require('../ZigBeeDevice')
const { parseXiaomiBatteryInfo, XIAOMI_STRUCT_ATTR } = require('../utils/xiaomi')

class AqaraDoorWindowSensor extends ZigBeeDevice {
  ready() {
    this.update({ status: 'online', joinTime: Math.floor(Date.now() / 1000) })

    this.subscribe(1, 'genOnOff', 'onOff', 1, 3600, 1, this.handleContactReport.bind(this))
    this.subscribe(1, 'genBasic', XIAOMI_STRUCT_ATTR, 1, 60, null, this.handleLifelineReport.bind(this))
  }

  handleContactReport(data) {
    this.log('handleContactReport:', data)
  }

  handleLifelineReport(data) {
    this.log('handleLifelineReport:', parseXiaomiBatteryInfo(data))
  }
}

module.exports = AqaraDoorWindowSensor

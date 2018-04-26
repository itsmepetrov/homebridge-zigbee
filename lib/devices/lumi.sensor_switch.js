const HomeKitDevice = require('../HomeKitDevice')
const { XIAOMI_STRUCT_ATTR, XIAOMI_MULTICLICK_ATTR, updateXiaomiButteryCharacteristics } = require('../utils/xiaomi')

const LONG_PRESS_THRESHOLD = 300

class XiaomiWirelessSwitch extends HomeKitDevice {
  constructor(data) {
    super({ model: 'lumi.sensor_switch', manufacturer: 'Xiaomi', ...data })
  }

  getAvailbleServices() {
    return [{
      name: 'Button',
      type: this.Service.StatelessProgrammableSwitch,
    }, {
      name: 'Battery',
      type: this.Service.BatteryService,
    }]
  }

  onDeviceReady() {
    this.zigbee.update({ status: 'online', joinTime: Math.floor(Date.now() / 1000) })
    this.zigbee.subscribe(1, 'genOnOff', 'onOff', 1, 3600, 1, this.handleClickReport.bind(this))
    this.zigbee.subscribe(1, 'genOnOff', XIAOMI_MULTICLICK_ATTR, 1, 3600, 1, this.handleClickReport.bind(this))
    this.zigbee.subscribe(1, 'genBasic', XIAOMI_STRUCT_ATTR, 1, 60, null, this.handleLifelineReport.bind(this))
  }

  handleClickReport(data) {
    const characteristic = this.getServiceCharacteristic('Button', this.Characteristic.ProgrammableSwitchEvent)
    if (data === 0) {
      this.lastClickTimestamp = Date.now()
    } else if (data === 1 && this.lastClickTimestamp && (Date.now() - this.lastClickTimestamp) > LONG_PRESS_THRESHOLD) {
      this.lastClickTimestamp = null
      characteristic.updateValue(this.Characteristic.ProgrammableSwitchEvent.LONG_PRESS)
    } else if (data === 1) {
      characteristic.updateValue(this.Characteristic.ProgrammableSwitchEvent.SINGLE_PRESS)
    } else if (data === 2) {
      characteristic.updateValue(this.Characteristic.ProgrammableSwitchEvent.DOUBLE_PRESS)
    }
  }

  handleLifelineReport(data) {
    updateXiaomiButteryCharacteristics(this, data)
  }
}

module.exports = XiaomiWirelessSwitch

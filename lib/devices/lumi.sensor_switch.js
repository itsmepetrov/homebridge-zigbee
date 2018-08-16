const HomeKitDevice = require('../HomeKitDevice')
const { XIAOMI_MULTICLICK_ATTR } = require('../utils/xiaomi')

const LONG_PRESS_THRESHOLD = 300

class XiaomiWirelessSwitch extends HomeKitDevice {
  static description() {
    return {
      model: 'lumi.sensor_switch',
      manufacturer: 'LUMI',
      name: 'Xiaomi Wireless Switch',
    }
  }

  getAvailbleServices() {
    return [{
      name: 'Button',
      type: 'StatelessProgrammableSwitch',
    }]
  }

  onDeviceReady() {
    this.zigbee.update({ status: 'online', joinTime: Math.floor(Date.now() / 1000) })
    const multiClickParser = {
      endpoint: 1,
      cluster: 'genOnOff',
      service: 'Button',
      characteristic: 'ProgrammableSwitchEvent',
      reportMinInt: 1,
      reportMaxInt: 3600,
      reportChange: 1,
      reportParser: this.handleClickReport,
    }
    this.mountServiceCharacteristic({
      ...multiClickParser,
      report: 'onOff',
    })
    this.mountServiceCharacteristic({
      ...multiClickParser,
      report: XIAOMI_MULTICLICK_ATTR,
    })
  }

  handleClickReport(data, device) {
    if (data === 0) {
      device.lastClickTimestamp = Date.now()
    } else if (
      data === 1 && device.lastClickTimestamp
      && (Date.now() - device.lastClickTimestamp) > LONG_PRESS_THRESHOLD
    ) {
      device.lastClickTimestamp = null
      return device.Characteristic.ProgrammableSwitchEvent.LONG_PRESS
    } else if (data === 1) {
      return device.Characteristic.ProgrammableSwitchEvent.SINGLE_PRESS
    } else if (data === 2) {
      return device.Characteristic.ProgrammableSwitchEvent.DOUBLE_PRESS
    }
  }
}

module.exports = XiaomiWirelessSwitch

const HomeKitDevice = require('../HomeKitDevice')
const { XIAOMI_MULTICLICK_ATTR, mountXiaomiButteryCharacteristics } = require('../utils/xiaomi')

class AqaraWirelessSwitch extends HomeKitDevice {
  static description() {
    return {
      model: 'lumi.sensor_switch.aq2',
      manufacturer: 'LUMI',
    }
  }

  getAvailbleServices() {
    return [{
      name: 'Button',
      type: 'StatelessProgrammableSwitch',
    }, {
      name: 'Battery',
      type: 'BatteryService',
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
    mountXiaomiButteryCharacteristics(this, {
      reportMinInt: 1,
      reportMaxInt: 60,
    })
  }

  handleClickReport(data, device) {
    if (data === 1) {
      return device.Characteristic.ProgrammableSwitchEvent.SINGLE_PRESS
    } if (data === 2) {
      return device.Characteristic.ProgrammableSwitchEvent.DOUBLE_PRESS
    }
    return device.Characteristic.ProgrammableSwitchEvent.LONG_PRESS
  }
}

module.exports = AqaraWirelessSwitch

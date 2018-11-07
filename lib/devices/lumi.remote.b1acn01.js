const HomeKitDevice = require('../HomeKitDevice')
const { mountXiaomiButteryCharacteristics } = require('../utils/xiaomi')

class AqaraWirelessSwitch2 extends HomeKitDevice {
  static get description() {
    return {
      model: 'lumi.remote.b1acn01',
      manufacturer: 'LUMI',
      name: 'Aqara Wireless Switch 2',
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
    this.mountServiceCharacteristic({
      endpoint: 1,
      cluster: 'genMultistateInput',
      service: 'Button',
      characteristic: 'ProgrammableSwitchEvent',
      report: 'presentValue',
      reportMinInt: 1,
      reportMaxInt: 60,
      reportChange: null,
      reportParser: this.handleClickReport,
    })
    mountXiaomiButteryCharacteristics(this, {
      reportMinInt: 1,
      reportMaxInt: 60,
    })
  }

  handleClickReport(data, device) {
    switch (data) {
      case 1:
        return device.Characteristic.ProgrammableSwitchEvent.SINGLE_PRESS
      case 2:
        return device.Characteristic.ProgrammableSwitchEvent.DOUBLE_PRESS
      case 255:
        return device.Characteristic.ProgrammableSwitchEvent.LONG_PRESS
      default:
        // Do nothing
    }
  }
}

module.exports = AqaraWirelessSwitch2

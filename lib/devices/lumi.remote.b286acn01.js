const HomeKitDevice = require('../HomeKitDevice')
const { mountXiaomiButteryCharacteristics } = require('../utils/xiaomi')

class AqaraLightSwitchDouble extends HomeKitDevice {
  static get description() {
    return {
      model: [
        'lumi.remote.b286acn01',
      ],
      manufacturer: 'LUMI',
      name: 'Aqara Light Switch Double',
    }
  }

  getAvailbleServices() {
    return [{
      name: 'LeftButton',
      type: 'StatelessProgrammableSwitch',
      subtype: 'Left',
    }, {
      name: 'RightButton',
      type: 'StatelessProgrammableSwitch',
      subtype: 'Right',
    }, {
      name: 'BothButton',
      type: 'StatelessProgrammableSwitch',
      subtype: 'Both',
    }, {
      name: 'Battery',
      type: 'BatteryService',
    }]
  }

  onDeviceReady() {
    this.zigbee.update({ status: 'online', joinTime: Math.floor(Date.now() / 1000) })
    const сlickParser = {
      cluster: 'genMultistateInput',
      characteristic: 'ProgrammableSwitchEvent',
      report: 'presentValue',
      reportMinInt: 1,
      reportMaxInt: 60,
      reportChange: null,
      reportParser: this.handleClickReport,
    }
    this.mountServiceCharacteristic({
      ...сlickParser,
      endpoint: 1,
      service: 'LeftButton',
    })
    this.mountServiceCharacteristic({
      ...сlickParser,
      endpoint: 2,
      service: 'RightButton',
    })
    this.mountServiceCharacteristic({
      ...сlickParser,
      endpoint: 3,
      service: 'BothButton',
    })
    mountXiaomiButteryCharacteristics(this, {
      reportMinInt: 1,
      reportMaxInt: 60,
    })
  }

  handleClickReport(data, device, characteristic) {
    switch (data) {
      case 1:
        characteristic.setValue(device.Characteristic.ProgrammableSwitchEvent.SINGLE_PRESS)
        break
      case 2:
        characteristic.setValue(device.Characteristic.ProgrammableSwitchEvent.DOUBLE_PRESS)
        break
      case 0:
        characteristic.setValue(device.Characteristic.ProgrammableSwitchEvent.LONG_PRESS)
        break
      default:
        // Do nothing
    }
  }
}

module.exports = AqaraLightSwitchDouble

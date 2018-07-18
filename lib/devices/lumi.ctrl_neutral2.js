const HomeKitDevice = require('../HomeKitDevice')

class AqaraWallSwitchDoubleL extends HomeKitDevice {
  static description() {
    return {
      model: 'lumi.ctrl_neutral2',
      manufacturer: 'LUMI',
    }
  }

  getAvailbleServices() {
    return [{
      name: 'LeftSwitch',
      type: 'Switch',
      subtype: 'left'
    }, {
      name: 'RightSwitch',
      type: 'Switch',
      subtype: 'right'
    }]
  }

  onDeviceReady() {
    this.zigbee.update({ status: 'online', joinTime: Math.floor(Date.now() / 1000) })

    this.mountServiceCharacteristic({
      endpoint: 2,
      cluster: 'genOnOff',
      service: 'LeftSwitch',
      characteristic: 'On',
      reportMinInt: 1,
      reportMaxInt: 3600,
      reportChange: 1,
      parser: 'onOff',
    })

    this.mountServiceCharacteristic({
        endpoint: 3,
        cluster: 'genOnOff',
        service: 'RightSwitch',
        characteristic: 'On',
        reportMinInt: 1,
        reportMaxInt: 3600,
        reportChange: 1,
        parser: 'onOff',
    })
  }
}

module.exports = AqaraWallSwitchDoubleL

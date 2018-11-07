const HomeKitDevice = require('../HomeKitDevice')

class AqaraWallSwitchDoubleLN extends HomeKitDevice {
  static get description() {
    return {
      model: 'lumi.ctrl_ln2.aq1',
      manufacturer: 'LUMI',
      name: 'Aqara Wall Switch Double LN',
    }
  }

  getAvailbleServices() {
    return [{
      name: 'LeftSwitch',
      type: 'Switch',
      subtype: 'left',
    }, {
      name: 'RightSwitch',
      type: 'Switch',
      subtype: 'right',
    }]
  }

  onDeviceReady() {
    this.zigbee.update({ status: 'online', joinTime: Math.floor(Date.now() / 1000) })
    this.mountServiceCharacteristic({
      endpoint: 1,
      cluster: 'genOnOff',
      service: 'LeftSwitch',
      characteristic: 'On',
      reportMinInt: 1,
      reportMaxInt: 3600,
      reportChange: 1,
      parser: 'onOff',
      setWaitResponse: true,
    })
    this.mountServiceCharacteristic({
      endpoint: 2,
      cluster: 'genOnOff',
      service: 'RightSwitch',
      characteristic: 'On',
      reportMinInt: 1,
      reportMaxInt: 3600,
      reportChange: 1,
      parser: 'onOff',
      setWaitResponse: true,
    })
  }
}

module.exports = AqaraWallSwitchDoubleLN

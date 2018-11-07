const HomeKitDevice = require('../HomeKitDevice')

class AqaraWallSwitchSingleLN extends HomeKitDevice {
  static get description() {
    return {
      model: 'lumi.ctrl_ln1.aq1',
      manufacturer: 'LUMI',
      name: 'Aqara Wall Switch Single LN',
    }
  }

  getAvailbleServices() {
    return [{
      name: 'Switch',
      type: 'Switch',
    }]
  }

  onDeviceReady() {
    this.zigbee.update({ status: 'online', joinTime: Math.floor(Date.now() / 1000) })
    this.mountServiceCharacteristic({
      endpoint: 1,
      cluster: 'genOnOff',
      service: 'Switch',
      characteristic: 'On',
      reportMinInt: 1,
      reportMaxInt: 3600,
      reportChange: 1,
      parser: 'onOff',
      setWaitResponse: true,
    })
  }
}

module.exports = AqaraWallSwitchSingleLN

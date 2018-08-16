const HomeKitDevice = require('../HomeKitDevice')

class TexasInstrumentsPlug extends HomeKitDevice {
  static description() {
    return {
      model: 'RICI01',
      manufacturer: 'TexasInstruments',
      name: 'Megafon Plug',
    }
  }

  getAvailbleServices() {
    return [{
      name: 'Outlet',
      type: 'Outlet',
    }]
  }

  onDeviceReady() {
    this.mountServiceCharacteristic({
      endpoint: 1,
      cluster: 'genOnOff',
      service: 'Outlet',
      characteristic: 'On',
      reportMinInt: 1,
      reportMaxInt: 2,
      reportChange: 1,
      parser: 'onOff',
    })
  }
}

module.exports = TexasInstrumentsPlug

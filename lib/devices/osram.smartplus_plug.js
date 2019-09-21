const HomeKitDevice = require('../HomeKitDevice')

class OsramSmartPlusPlug extends HomeKitDevice {
  static get description() {
    return {
      model: 'Plug 01',
      manufacturer: 'OSRAM',
      name: 'Smart+ Plug',
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
      endpoint: 3,
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

module.exports = OsramSmartPlusPlug

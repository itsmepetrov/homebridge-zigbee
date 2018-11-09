const HomeKitDevice = require('../HomeKitDevice')

class AqaraPlug extends HomeKitDevice {
  static get description() {
    return {
      model: 'lumi.plug',
      manufacturer: 'LUMI',
      name: 'Aqara Plug',
    }
  }

  getAvailbleServices() {
    return [{
      name: 'Outlet',
      type: 'Outlet',
      history: {
        type: 'energy',
        use: 'power',
      },
    }]
  }

  onDeviceReady() {
    this.zigbee.update({ status: 'online', joinTime: Math.floor(Date.now() / 1000) })
    this.addCharacteristicIfDoesNotExist(this.getService('Outlet'), 'EveCurrentConsumption')
    this.addCharacteristicIfDoesNotExist(this.getService('Outlet'), 'EveTotalConsumption')
    this.mountServiceCharacteristic({
      endpoint: 1,
      cluster: 'genOnOff',
      service: 'Outlet',
      characteristic: 'On',
      reportMinInt: 1,
      reportMaxInt: 300,
      reportChange: 1,
      parser: 'onOff',
      setWaitResponse: true,
    })
    this.mountServiceCharacteristic({
      endpoint: 2,
      cluster: 'genAnalogInput',
      service: 'Outlet',
      characteristic: 'OutletInUse',
      reportMinInt: 1,
      reportMaxInt: 60,
      reportChange: null,
      parser: 'energyUsage',
      getRequestOnStart: true,
    })
    this.mountServiceCharacteristic({
      endpoint: 2,
      cluster: 'genAnalogInput',
      service: 'Outlet',
      characteristic: 'EveCurrentConsumption',
      reportMinInt: 1,
      reportMaxInt: 60,
      reportChange: null,
      parser: 'consumption',
      getRequestOnStart: true,
    })
    this.mountServiceCharacteristic({
      endpoint: 2,
      cluster: 'genAnalogInput',
      service: 'Outlet',
      characteristic: 'EveTotalConsumption',
      reportMinInt: 1,
      reportMaxInt: 60,
      reportChange: null,
      parser: 'totalConsumption',
      getRequestOnStart: true,
    })
  }
}

module.exports = AqaraPlug

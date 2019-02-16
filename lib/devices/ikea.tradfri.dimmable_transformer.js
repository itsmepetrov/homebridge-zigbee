const HomeKitDevice = require('../HomeKitDevice')

class IkeaTradfriDimmableTransformer extends HomeKitDevice {
  static get description() {
    return {
      model: [
        'TRADFRI transformer 10W',
        'TRADFRI transformer 30W',
        'TRADFRI Driver 10W',
        'TRADFRI Driver 30W',
      ],
      manufacturer: 'IKEA of Sweden',
      name: 'IKEA TRADFRI',
    }
  }

  getAvailbleServices() {
    return [{
      name: 'Bulb',
      type: 'Lightbulb',
    }]
  }

  onDeviceReady() {
    this.mountServiceCharacteristic({
      endpoint: 1,
      cluster: 'genOnOff',
      service: 'Bulb',
      characteristic: 'On',
      reportMinInt: 1,
      reportMaxInt: 300,
      reportChange: 1,
      parser: 'onOff',
    })
    this.mountServiceCharacteristic({
      endpoint: 1,
      cluster: 'genLevelCtrl',
      service: 'Bulb',
      characteristic: 'Brightness',
      reportMinInt: 1,
      reportMaxInt: 300,
      reportChange: 1,
      parser: 'dim',
    })
  }
}

module.exports = IkeaTradfriDimmableTransformer

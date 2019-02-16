const HomeKitDevice = require('../HomeKitDevice')

class IkeaTradfriDimmableBulb extends HomeKitDevice {
  static get description() {
    return {
      model: [
        'TRADFRI bulb E27 opal 1000lm',
        'TRADFRI bulb E27 W opal 1000lm',
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

module.exports = IkeaTradfriDimmableBulb

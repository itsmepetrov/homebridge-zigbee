const HomeKitDevice = require('../HomeKitDevice')

class IkeaTradfriBulb extends HomeKitDevice {
  static description() {
    return {
      model: [
        'TRADFRI bulb E27 WSopal 980lm',
        'TRADFRI bulb E27 WS opal 980lm',
        'TRADFRI bulb E12 WS opal 400lm',
        'TRADFRI bulb E26 WS clear 950lm',
        'TRADFRI bulb E26 WS opal 980lm',
        'TRADFRI bulb E26 WSopal 980lm',
        'TRADFRI bulb E27 WS clear 950lm',
      ],
      manufacturer: 'IKEA of Sweden',
    }
  }

  getAvailbleServices() {
    return [{
      name: 'Bulb',
      type: 'Lightbulb',
    }]
  }

  onDeviceReady() {
    const lightingColorCtrlAttrs = this.zigbee.endpoint(1).clusters.lightingColorCtrl.attrs
    this.colorTempPhysicalMin = lightingColorCtrlAttrs.colorTempPhysicalMin
    this.colorTempPhysicalMax = lightingColorCtrlAttrs.colorTempPhysicalMax
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
    this.mountServiceCharacteristic({
      endpoint: 1,
      cluster: 'lightingColorCtrl',
      service: 'Bulb',
      characteristic: 'ColorTemperature',
      reportMinInt: 1,
      reportMaxInt: 300,
      reportChange: 1,
      parser: 'colorTemperature',
    })
  }
}

module.exports = IkeaTradfriBulb

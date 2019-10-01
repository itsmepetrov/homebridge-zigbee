const HomeKitDevice = require('../HomeKitDevice')

class GledoptoRgbBulb extends HomeKitDevice {
  static get description() {
    return {
      model: 'GL-B-008ZS',
      manufacturer: 'GLEDOPTO',
      name: 'Controller',
    }
  }

  getAvailbleServices() {
    return [{
      name: 'Bulb',
      type: 'Lightbulb',
    }]
  }

  onDeviceReady() {
    const lightingColorCtrlAttrs = this.zigbee.endpoint(11).clusters.lightingColorCtrl.attrs
    this.colorTempPhysicalMin = lightingColorCtrlAttrs.colorTempPhysicalMin
    this.colorTempPhysicalMax = lightingColorCtrlAttrs.colorTempPhysicalMax
    this.mountServiceCharacteristic({
      endpoint: 11,
      cluster: 'genOnOff',
      service: 'Bulb',
      characteristic: 'On',
      reportMinInt: 1,
      reportMaxInt: 300,
      reportChange: 1,
      parser: 'onOff',
    })
    this.mountServiceCharacteristic({
      endpoint: 11,
      cluster: 'genLevelCtrl',
      service: 'Bulb',
      characteristic: 'Brightness',
      reportMinInt: 1,
      reportMaxInt: 300,
      reportChange: 1,
      parser: 'dim',
    })
    this.mountServiceCharacteristic({
      endpoint: 11,
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

module.exports = GledoptoRgbBulb

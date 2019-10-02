const HomeKitDevice = require('../HomeKitDevice')

class GledoptoRgbBulb extends HomeKitDevice {
  static get description() {
    return {
      model: 'GL-B-008ZS',
      manufacturer: 'GLEDOPTO',
      name: 'RGB Bulb',
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
    this.brightnessTimeout = null

    const onCharacteristic = this.getServiceCharacteristic('Bulb', 'On')
    const colorTemperature = this.getServiceCharacteristic('Bulb', 'ColorTemperature')
    const brightnessCharacteristic = this.getServiceCharacteristic('Bulb', 'Brightness')

    colorTemperature.setProps({
      minValue: lightingColorCtrlAttrs.colorTempPhysicalMin,
      maxValue: lightingColorCtrlAttrs.colorTempPhysicalMax,
    })

    onCharacteristic.on('set', (value) => {
      this.clearTimeout(this.brightnessTimeout)
      if (value) {
        this.brightnessTimeout = this.setTimeout(() => {
          brightnessCharacteristic.setValue(brightnessCharacteristic.value)
        }, 500)
      }
    })

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
      reportParser: value => Math.round(value),
      getParser: value => Math.round(value),
      setParser: value => ({
        colortemp: Math.round(value),
        transtime: 5,
      }),
    })
  }
}

module.exports = GledoptoRgbBulb

const HomeKitDevice = require('../HomeKitDevice')
const { mountXiaomiButteryCharacteristics } = require('../utils/xiaomi')

const LONG_PRESS_THRESHOLD = 500

class AqaraLightSwitchSingle extends HomeKitDevice {
  static description() {
    return {
      model: 'lumi.sensor_86sw1lu',
      manufacturer: 'LUMI',
    }
  }

  getAvailbleServices() {
    return [{
      name: 'Button',
      type: 'StatelessProgrammableSwitch',
      subtype: 'Left',
    }, {
      name: 'Battery',
      type: 'BatteryService',
    }]
  }

  onDeviceReady() {
    this.zigbee.update({ status: 'online', joinTime: Math.floor(Date.now() / 1000) })
    const defaultButtonProps = { minValue: 0, maxValue: 1, validValues: [0, 1] }
    this.getServiceCharacteristic('Button', 'ProgrammableSwitchEvent').setProps(defaultButtonProps)
    this.mountServiceCharacteristic({
      endpoint: 1,
      cluster: 'genOnOff',
      service: 'Button',
      characteristic: 'ProgrammableSwitchEvent',
      reportMinInt: 1,
      reportMaxInt: 3600,
      reportChange: 1,
      report: 'onOff',
      reportParser: this.handleClickReport,
    })
    mountXiaomiButteryCharacteristics(this, {
      reportMinInt: 1,
      reportMaxInt: 60,
    })
  }

  handleClickReport(data, device, characteristic) {
    if (!device.clickTimeout) {
      device.clickTimeout = setTimeout(() => {
        characteristic.setValue(device.Characteristic.ProgrammableSwitchEvent.SINGLE_PRESS)
        clearTimeout(device.clickTimeout)
        device.clickTimeout = null
      }, LONG_PRESS_THRESHOLD)
    } else {
      clearTimeout(device.clickTimeout)
      device.clickTimeout = null
      return device.Characteristic.ProgrammableSwitchEvent.DOUBLE_PRESS
    }
  }
}

module.exports = AqaraLightSwitchSingle

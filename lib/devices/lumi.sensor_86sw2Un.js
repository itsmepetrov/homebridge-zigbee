const HomeKitDevice = require('../HomeKitDevice')
const { mountXiaomiButteryCharacteristics } = require('../utils/xiaomi')

const LONG_PRESS_THRESHOLD = 500

class AqaraLightSwitchDouble extends HomeKitDevice {
  static description() {
    return {
      model: [
        'lumi.sensor_86sw2Un',
        'lumi.sensor_86sw2.es1',
      ],
      manufacturer: 'LUMI',
      name: 'Aqara Light Switch Double',
    }
  }

  getAvailbleServices() {
    return [{
      name: 'LeftButton',
      type: 'StatelessProgrammableSwitch',
      subtype: 'Left',
    }, {
      name: 'RightButton',
      type: 'StatelessProgrammableSwitch',
      subtype: 'Right',
    }, {
      name: 'BothButton',
      type: 'StatelessProgrammableSwitch',
      subtype: 'Both',
    }, {
      name: 'Battery',
      type: 'BatteryService',
    }]
  }

  onDeviceReady() {
    this.zigbee.update({ status: 'online', joinTime: Math.floor(Date.now() / 1000) })
    const defaultButtonProps = { minValue: 0, maxValue: 1, validValues: [0, 1] }
    this.getServiceCharacteristic(
      'LeftButton', 'ProgrammableSwitchEvent'
    ).setProps(defaultButtonProps)
    this.getServiceCharacteristic(
      'RightButton', 'ProgrammableSwitchEvent'
    ).setProps(defaultButtonProps)
    this.getServiceCharacteristic(
      'BothButton', 'ProgrammableSwitchEvent'
    ).setProps(defaultButtonProps)
    const сlickParser = {
      cluster: 'genOnOff',
      characteristic: 'ProgrammableSwitchEvent',
      reportMinInt: 1,
      reportMaxInt: 3600,
      reportChange: 1,
      report: 'onOff',
    }
    this.mountServiceCharacteristic({
      ...сlickParser,
      endpoint: 1,
      service: 'LeftButton',
      reportParser: this.handleClickReport.bind(this, 'left'),
    })
    this.mountServiceCharacteristic({
      ...сlickParser,
      endpoint: 2,
      service: 'RightButton',
      reportParser: this.handleClickReport.bind(this, 'right'),
    })
    this.mountServiceCharacteristic({
      ...сlickParser,
      endpoint: 3,
      service: 'BothButton',
      reportParser: this.handleClickReport.bind(this, 'both'),
    })
    mountXiaomiButteryCharacteristics(this, {
      reportMinInt: 1,
      reportMaxInt: 60,
    })
  }

  handleClickReport(type, data, device, characteristic) {
    const timeoutKey = `${type}ClickTimeout`
    if (!device[timeoutKey]) {
      device[timeoutKey] = setTimeout(() => {
        characteristic.setValue(device.Characteristic.ProgrammableSwitchEvent.SINGLE_PRESS)
        clearTimeout(device[timeoutKey])
        device[timeoutKey] = null
      }, LONG_PRESS_THRESHOLD)
    } else {
      clearTimeout(device[timeoutKey])
      device[timeoutKey] = null
      return device.Characteristic.ProgrammableSwitchEvent.DOUBLE_PRESS
    }
  }
}

module.exports = AqaraLightSwitchDouble

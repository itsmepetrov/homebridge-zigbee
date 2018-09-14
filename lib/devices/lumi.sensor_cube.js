const HomeKitDevice = require('../HomeKitDevice')
const { mountXiaomiButteryCharacteristics } = require('../utils/xiaomi')

class AqaraCubeSensor extends HomeKitDevice {
  static get description() {
    return {
      model: 'lumi.sensor_cube',
      manufacturer: 'LUMI',
      name: 'Aqara Cube Sensor',
    }
  }

  getAvailbleServices() {
    return [{
      name: 'Shake',
      type: 'StatelessProgrammableSwitch',
      subtype: 'Shake',
    }, {
      name: 'Wakeup',
      type: 'StatelessProgrammableSwitch',
      subtype: 'Wakeup',
    }, {
      name: 'Fall',
      type: 'StatelessProgrammableSwitch',
      subtype: 'Fall',
    }, {
      name: 'Tap',
      type: 'StatelessProgrammableSwitch',
      subtype: 'Tap',
    }, {
      name: 'Slide',
      type: 'StatelessProgrammableSwitch',
      subtype: 'Slide',
    }, {
      name: 'Flip 180',
      type: 'StatelessProgrammableSwitch',
      subtype: 'Flip180',
    }, {
      name: 'Flip 90',
      type: 'StatelessProgrammableSwitch',
      subtype: 'Flip90',
    }, {
      name: 'Rotate Left',
      type: 'StatelessProgrammableSwitch',
      subtype: 'RotateLeft',
    }, {
      name: 'Rotate Right',
      type: 'StatelessProgrammableSwitch',
      subtype: 'RotateRight',
    }, {
      name: 'Battery',
      type: 'BatteryService',
    }]
  }

  onDeviceReady() {
    this.zigbee.update({ status: 'online', joinTime: Math.floor(Date.now() / 1000) })
    const defaultActionProps = { minValue: 0, maxValue: 1, validValues: [0] }
    this.updateActionService('Shake', defaultActionProps, 1)
    this.updateActionService('Wakeup', defaultActionProps, 2)
    this.updateActionService('Fall', defaultActionProps, 3)
    this.updateActionService('Tap', defaultActionProps, 4)
    this.updateActionService('Slide', defaultActionProps, 5)
    this.updateActionService('Flip 180', defaultActionProps, 6)
    this.updateActionService('Flip 90', defaultActionProps, 7)
    this.updateActionService('Rotate Left', defaultActionProps, 8)
    this.updateActionService('Rotate Right', defaultActionProps, 9)
    const actionMultistateConfig = {
      endpointId: 2,
      clusterId: 'genMultistateInput',
      attrId: 'presentValue',
      minInt: 1,
      maxInt: 60,
      repChange: null,
    }
    const actionAnalogConfig = {
      endpointId: 3,
      clusterId: 'genAnalogInput',
      attrId: 'presentValue',
      minInt: 1,
      maxInt: 60,
      repChange: null,
    }
    this.zigbee.subscribe(
      actionMultistateConfig.endpointId,
      actionMultistateConfig.clusterId,
      actionMultistateConfig.attrId,
      actionMultistateConfig.minInt,
      actionMultistateConfig.maxInt,
      actionMultistateConfig.repChange,
      this.handleMultistateActionReport.bind(this)
    )
    this.zigbee.subscribe(
      actionAnalogConfig.endpointId,
      actionAnalogConfig.clusterId,
      actionAnalogConfig.attrId,
      actionAnalogConfig.minInt,
      actionAnalogConfig.maxInt,
      actionAnalogConfig.repChange,
      this.handleAnalogActionReport.bind(this)
    )
    mountXiaomiButteryCharacteristics(this, {
      reportMinInt: 1,
      reportMaxInt: 60,
    })
  }

  updateActionService(service, props, index) {
    this.getServiceCharacteristic(
      service, 'ProgrammableSwitchEvent'
    ).setProps(props)
    this.getServiceCharacteristic(
      service, 'ServiceLabelIndex'
    ).setProps(index)
  }

  handleMultistateActionReport(value) {
    /*
    Source: https://github.com/kirovilya/ioBroker.zigbee
        +---+
        | 2 |
    +---+---+---+
    | 4 | 0 | 1 |
    +---+---+---+
        |M5I|
        +---+
        | 3 |
        +---+
    Side 5 is with the MI logo, side 3 contains the battery door.
    value = 0 = shake
    value = 2 = wakeup
    value = 3 = fly/fall
    value = y + x * 8 + 64 = 90º flip from side x on top to side y on top
    value = x + 128 = 180º flip to side x on top
    value = x + 256 = push/slide cube while side x is on top
    value = x + 512 = double tap while side x is on top
    */
    let service
    if (value === 0) {
      service = 'Shake'
    } else if (value === 2) {
      service = 'Wakeup'
    } else if (value === 3) {
      service = 'Fall'
    } else if (value >= 512) {
      service = 'Tap'
    } else if (value >= 256) {
      service = 'Slide'
    } else if (value >= 128) {
      service = 'Flip 180'
    } else if (value >= 64) {
      service = 'Flip 90'
    }
    if (service) {
      this.getServiceCharacteristic(
        service, 'ProgrammableSwitchEvent'
      ).updateValue(this.Characteristic.ProgrammableSwitchEvent.SINGLE_PRESS)
    }
  }

  handleAnalogActionReport(value) {
    /*
    Source: https://github.com/kirovilya/ioBroker.zigbee
    value = rotation angle left < 0, right > 0
    */
    const service = value < 0 ? 'Rotate Left' : 'Rotate Right'
    this.getServiceCharacteristic(
      service, 'ProgrammableSwitchEvent'
    ).updateValue(this.Characteristic.ProgrammableSwitchEvent.SINGLE_PRESS)
  }
}

module.exports = AqaraCubeSensor

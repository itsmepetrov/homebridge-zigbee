const HomeKitDevice = require('../HomeKitDevice')

class AqaraCurtain extends HomeKitDevice {
  static get description() {
    return {
      model: 'lumi.curtain',
      manufacturer: 'LUMI',
      name: 'Aqara Curtain',
    }
  }

  getAvailbleServices() {
    return [{
      name: 'Covering',
      type: 'WindowCovering',
    }]
  }

  onDeviceReady() {
    this.zigbee.update({ status: 'online', joinTime: Math.floor(Date.now() / 1000) })
    const positionState = this.getServiceCharacteristic('Covering', 'PositionState')
    const targetPosition = this.getServiceCharacteristic('Covering', 'TargetPosition')
    this.mountServiceCharacteristic({
      endpoint: 1,
      cluster: 'closuresWindowCovering',
      service: 'Covering',
      characteristic: 'CurrentPosition',
      get: 'currentPositionLiftPercentage',
      getParser: (data, device) => {
        positionState.updateValue(device.Characteristic.PositionState.STOPPED)
        targetPosition.updateValue(data)
        return data
      },
      getWaitResponse: false,
    })
    this.mountServiceCharacteristic({
      endpoint: 1,
      cluster: 'genAnalogOutput',
      service: 'Covering',
      characteristic: 'CurrentPosition',
      report: 'presentValue',
      reportMinInt: 1,
      reportMaxInt: 10,
      reportChange: 1,
      reportParser: (data, device, characteristic) => {
        positionState.updateValue(device.Characteristic.PositionState.STOPPED)
        if (device.triggeredManually) {
          const calibrationDiff = Math.abs(data - targetPosition.value)
          if (calibrationDiff <= 3) {
            targetPosition.updateValue(data)
            device.triggeredManually = false
          }
        } else {
          if (data > characteristic.value) { // eslint-disable-line no-lonely-if
            targetPosition.updateValue(100)
          } else if (data < characteristic.value) {
            targetPosition.updateValue(0)
          } else if (data === 0 && characteristic.value === 0) {
            targetPosition.updateValue(100)
          } else if (data === 100 && characteristic.value === 100) {
            targetPosition.updateValue(0)
          }
        }
        return data
      },
    })
    this.mountServiceCharacteristic({
      endpoint: 1,
      cluster: 'closuresWindowCovering',
      service: 'Covering',
      characteristic: 'TargetPosition',
      set: () => 'goToLiftPercentage',
      setParser: (data, device) => {
        device.triggeredManually = true
        return { percentageliftvalue: data }
      },
      setWaitResponse: false,
    })
  }
}

module.exports = AqaraCurtain

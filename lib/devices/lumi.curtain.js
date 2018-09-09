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
    const currentStatusParser = {
      reportMinInt: 1,
      reportMaxInt: 3600,
      reportChange: 1,
      reportParser: (data, device) => {
        positionState.updateValue(device.Characteristic.PositionState.STOPPED)
        const calibrationDiff = Math.abs(data - targetPosition.value)
        if (calibrationDiff <= 2 && calibrationDiff >= 1) {
          positionState.updateValue(device.Characteristic.PositionState.STOPPED)
          targetPosition.updateValue(data)
        }
        return data
      },
    }
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
      report: 'currentPositionLiftPercentage',
      ...currentStatusParser,
    })
    this.mountServiceCharacteristic({
      endpoint: 1,
      cluster: 'genAnalogOutput',
      service: 'Covering',
      characteristic: 'CurrentPosition',
      report: 'presentValue',
      ...currentStatusParser,
    })
    this.mountServiceCharacteristic({
      endpoint: 1,
      cluster: 'closuresWindowCovering',
      service: 'Covering',
      characteristic: 'TargetPosition',
      set: () => 'goToLiftPercentage',
      setParser: data => ({ percentageliftvalue: data }),
      setWaitResponse: false,
    })
  }
}

module.exports = AqaraCurtain

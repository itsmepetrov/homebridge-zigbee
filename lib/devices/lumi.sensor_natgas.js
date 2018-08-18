const HomeKitDevice = require('../HomeKitDevice')

class HoneywellNatgasSensor extends HomeKitDevice {
  static get description() {
    return {
      model: 'lumi.sensor_natgas',
      manufacturer: 'LUMI',
      name: 'Honeywell Natgas Sensor',
    }
  }

  getAvailbleServices() {
    return [{
      name: 'GasLeak',
      type: 'SmokeSensor',
    }]
  }

  onDeviceReady() {
    this.zigbee.update({ status: 'online', joinTime: Math.floor(Date.now() / 1000) })
    this.unstableStatusMountServiceCharacteristic({
      endpoint: 1,
      cluster: 'ssIasZone',
      service: 'GasLeak',
      characteristic: 'SmokeDetected',
      status: 'zoneStatus',
      statusParser: (data, device) => data === 1
        ? device.Characteristic.SmokeDetected.SMOKE_DETECTED
        : device.Characteristic.SmokeDetected.SMOKE_NOT_DETECTED,
    })
  }
}

module.exports = HoneywellNatgasSensor

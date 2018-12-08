const HomeKitDevice = require('../HomeKitDevice')

class HoneywellSmokeSensor extends HomeKitDevice {
  static get description() {
    return {
      model: 'lumi.sensor_smoke',
      manufacturer: 'LUMI',
      name: 'Honeywell Smoke Sensor',
    }
  }

  getAvailbleServices() {
    return [{
      name: 'SmokeLeak',
      type: 'SmokeSensor',
    }]
  }

  onDeviceReady() {
    this.zigbee.update({ status: 'online', joinTime: Math.floor(Date.now() / 1000) })
    this.unstableStatusMountServiceCharacteristic({
      endpoint: 1,
      cluster: 'ssIasZone',
      service: 'SmokeLeak',
      characteristic: 'SmokeDetected',
      status: 'zoneStatus',
      statusParser: (data, device) => data === 1
        ? device.Characteristic.SmokeDetected.SMOKE_DETECTED
        : device.Characteristic.SmokeDetected.SMOKE_NOT_DETECTED,
    })
  }
}

module.exports = HoneywellSmokeSensor

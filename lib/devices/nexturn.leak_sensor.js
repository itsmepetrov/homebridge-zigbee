const HomeKitDevice = require('../HomeKitDevice')

class NexturnLeakSensor extends HomeKitDevice {
  static description() {
    return {
      model: 'Leak_Sensor',
      manufacturer: 'Nexturn',
    }
  }

  getAvailbleServices() {
    return [{
      name: 'WaterLeak',
      type: 'LeakSensor',
    }, {
      name: 'Battery',
      type: 'BatteryService',
    }]
  }

  onDeviceReady() {
    this.zigbee.unstableAISZoneEnroll(1);
    this.unstableStatusMountServiceCharacteristic({
      endpoint: 1,
      cluster: 'ssIasZone',
      service: 'WaterLeak',
      characteristic: 'LeakDetected',
      parser: 'leak',
    })
  }
}

module.exports = NexturnLeakSensor

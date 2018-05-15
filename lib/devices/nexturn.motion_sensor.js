const HomeKitDevice = require('../HomeKitDevice')

class NexturnMotionSensor extends HomeKitDevice {
  static description() {
    return {
      model: 'Motion_Sensor',
      manufacturer: 'Nexturn',
    }
  }

  getAvailbleServices() {
    return [{
      name: 'Motion',
      type: 'MotionSensor',
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
      service: 'Motion',
      characteristic: 'MotionDetected',
      status: 'zoneStatus',
      statusParser: (data) => data === 1,
    })
  }
}

module.exports = NexturnMotionSensor

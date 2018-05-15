const HomeKitDevice = require('../HomeKitDevice')

class NexturnDoorSensor extends HomeKitDevice {
  static description() {
    return {
      model: 'Door_Sensor',
      manufacturer: 'Nexturn',
    }
  }

  getAvailbleServices() {
    return [{
      name: 'Contact',
      type: 'ContactSensor',
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
      service: 'Contact',
      characteristic: 'ContactSensorState',
      parser: 'contact',
    })
  }
}

module.exports = NexturnDoorSensor

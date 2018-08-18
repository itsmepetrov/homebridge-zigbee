const HomeKitDevice = require('../HomeKitDevice')

class NexturnDoorSensor extends HomeKitDevice {
  static get description() {
    return {
      model: 'Door_Sensor',
      manufacturer: 'Nexturn',
      name: 'Megafon Door Sensor',
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
    this.zigbee.unstableAISZoneEnroll(1)
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

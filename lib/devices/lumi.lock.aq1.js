const HomeKitDevice = require('../HomeKitDevice')
const {
  XIAOMI_AQARA_LOCK_OPEN_ATTR,
  XIAOMI_AQARA_LOCK_WRONG_PASS_ATTR,
  mountXiaomiButteryCharacteristics,
} = require('../utils/xiaomi')

// Should be configurable outside
const OPEN_STATUS_RESET_TIMEOUT = 10
const WRONG_PASSWORD_STATUS_RESET_TIMEOUT = 10

class AqaraLock extends HomeKitDevice {
  static get description() {
    return {
      model: 'lumi.lock.aq1',
      manufacturer: 'LUMI',
      name: 'Aqara Lock',
    }
  }

  getAvailbleServices() {
    return [{
      name: 'Open Status',
      type: 'ContactSensor',
    }, {
      name: 'Wrong Password Status',
      type: 'OccupancySensor',
    }, {
      name: 'Battery',
      type: 'BatteryService',
    }]
  }

  onDeviceReady() {
    this.zigbee.update({ status: 'online', joinTime: Math.floor(Date.now() / 1000) })
    this.mountServiceCharacteristic({
      endpoint: 1,
      cluster: 'closuresDoorLock',
      service: 'Open Status',
      characteristic: 'ContactSensorState',
      report: XIAOMI_AQARA_LOCK_OPEN_ATTR,
      reportParser: (data, device, characteristic) => {
        // Set and clear open timeout
        device.clearTimeout(device.openTimeout)
        // Reset characteristic
        device.openTimeout = device.setTimeout(() => {
          characteristic.updateValue(device.Characteristic.ContactSensorState.CONTACT_DETECTED)
        }, OPEN_STATUS_RESET_TIMEOUT * 1000)
        // Update characteristic
        return device.Characteristic.ContactSensorState.CONTACT_NOT_DETECTED
      },
    })
    this.mountServiceCharacteristic({
      endpoint: 1,
      cluster: 'closuresDoorLock',
      service: 'Wrong Password Status',
      characteristic: 'OccupancyDetected',
      report: XIAOMI_AQARA_LOCK_WRONG_PASS_ATTR,
      reportParser: (data, device, characteristic) => {
        // Set and clear wrong password timeout
        device.clearTimeout(device.wrongPasswordTimeout)
        // Reset characteristic
        device.wrongPasswordTimeout = device.setTimeout(() => {
          characteristic.updateValue(device.Characteristic.OccupancyDetected.OCCUPANCY_NOT_DETECTED)
        }, WRONG_PASSWORD_STATUS_RESET_TIMEOUT * 1000)
        // Update characteristic
        return device.Characteristic.OccupancyDetected.OCCUPANCY_DETECTED
      },
    })
    mountXiaomiButteryCharacteristics(this, {
      reportMinInt: 1,
      reportMaxInt: 60,
    })
  }
}

module.exports = AqaraLock

const HomeKitDevice = require('../HomeKitDevice')

class XiaomiHumanBodySensor extends HomeKitDevice {
  static description() {
    return {
      model: 'lumi.sensor_motion',
      manufacturer: 'LUMI',
      name: 'Xiaomi Human Body Sensor',
    }
  }

  getAvailbleServices() {
    return [{
      name: 'Motion',
      type: 'MotionSensor',
    }]
  }

  onDeviceReady() {
    this.zigbee.update({ status: 'online', joinTime: Math.floor(Date.now() / 1000) })
    this.mountServiceCharacteristic({
      endpoint: 1,
      cluster: 'msOccupancySensing',
      service: 'Motion',
      characteristic: 'MotionDetected',
      reportMinInt: 1,
      reportMaxInt: 60,
      reportChange: 1,
      parser: 'occupancy',
      get: null,
    })
  }
}

module.exports = XiaomiHumanBodySensor

const HomeKitDevice = require('../HomeKitDevice')
const { mountXiaomiButteryCharacteristics } = require('../utils/xiaomi')

class AqaraHumanBodySensor extends HomeKitDevice {
  static get description() {
    return {
      model: 'lumi.sensor_motion.aq2',
      manufacturer: 'LUMI',
      name: 'Aqara Human Body Sensor',
    }
  }

  getAvailbleServices() {
    return [{
      name: 'Motion',
      type: 'MotionSensor',
    }, {
      name: 'Light',
      type: 'LightSensor',
    }, {
      name: 'Battery',
      type: 'BatteryService',
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
    this.mountServiceCharacteristic({
      endpoint: 1,
      cluster: 'msIlluminanceMeasurement',
      service: 'Light',
      characteristic: 'CurrentAmbientLightLevel',
      reportMinInt: 1,
      reportMaxInt: 60,
      reportChange: 1,
      parser: 'illuminance',
      get: null,
    })
    mountXiaomiButteryCharacteristics(this, {
      reportMinInt: 1,
      reportMaxInt: 60,
    })
  }
}

module.exports = AqaraHumanBodySensor

const HomeKitDevice = require('../HomeKitDevice')
const { mountXiaomiButteryCharacteristics } = require('../utils/xiaomi')

class AqaraWaterSensor extends HomeKitDevice {
  static get description() {
    return {
      model: 'lumi.sensor_wleak.aq1',
      manufacturer: 'LUMI',
      name: 'Aqara Water Sensor',
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
    this.zigbee.update({ status: 'online', joinTime: Math.floor(Date.now() / 1000) })
    this.unstableStatusMountServiceCharacteristic({
      endpoint: 1,
      cluster: 'ssIasZone',
      service: 'WaterLeak',
      characteristic: 'LeakDetected',
      parser: 'leak',
    })
    mountXiaomiButteryCharacteristics(this, {
      reportMinInt: 1,
      reportMaxInt: 60,
    })
  }
}

module.exports = AqaraWaterSensor

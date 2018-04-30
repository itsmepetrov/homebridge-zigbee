const HomeKitDevice = require('../HomeKitDevice')
const { XIAOMI_STRUCT_OLD_ATTR /* , mountXiaomiButteryCharacteristics */ } = require('../utils/xiaomi')

class XiaomiDoorWindowSensor extends HomeKitDevice {
  static description() {
    return {
      model: 'lumi.sensor_magnet',
      manufacturer: 'LUMI',
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
    this.zigbee.update({ status: 'online', joinTime: Math.floor(Date.now() / 1000) })
    this.zigbee.subscribe(1, 'genBasic', XIAOMI_STRUCT_OLD_ATTR, 1, 60, 1, this.handleLifelineReport.bind(this))
    this.mountServiceCharacteristic({
      endpoint: 1,
      cluster: 'genOnOff',
      service: 'Contact',
      characteristic: 'ContactSensorState',
      reportMinInt: 1,
      reportMaxInt: 3600,
      reportChange: 1,
      parser: 'contact',
      get: null,
    })
    // mountXiaomiButteryCharacteristics(this, {
    //   reportMinInt: 1,
    //   reportMaxInt: 60,
    // })
  }

  handleLifelineReport(data) {
    this.log('handleLifelineReport:', data)
  }
}

module.exports = XiaomiDoorWindowSensor

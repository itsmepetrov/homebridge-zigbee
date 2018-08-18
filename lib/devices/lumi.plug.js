const HomeKitDevice = require('../HomeKitDevice')
// const { XIAOMI_STRUCT_ATTR, parseXiaomiStruct } = require('../utils/xiaomi')

class AqaraPlug extends HomeKitDevice {
  static get description() {
    return {
      model: 'lumi.plug',
      manufacturer: 'LUMI',
      name: 'Aqara Plug',
    }
  }

  getAvailbleServices() {
    return [{
      name: 'Outlet',
      type: 'Outlet',
    }, /* {
      name: '???',
      type: ???
    }, {
      name: 'Battery',
      type: this.Service.BatteryService,
    } */]
  }

  onDeviceReady() {
    this.zigbee.update({ status: 'online', joinTime: Math.floor(Date.now() / 1000) })
    // this.zigbee.subscribe(
    //   2, 'genAnalogInput', 'presentValue', 1, 300, 10, this.handlePowerReport.bind(this)
    // )
    // this.zigbee.subscribe(
    //   3, 'genAnalogInput', 'presentValue', 300, 1800, 1, this.handleMeterPowerReport.bind(this)
    // )
    // this.zigbee.subscribe(
    //   1, 'genBasic', XIAOMI_STRUCT_ATTR, 1, 60, null, this.handleLifelineReport.bind(this)
    // )

    this.mountServiceCharacteristic({
      endpoint: 1,
      cluster: 'genOnOff',
      service: 'Outlet',
      characteristic: 'On',
      reportMinInt: 1,
      reportMaxInt: 300,
      reportChange: 1,
      parser: 'onOff',
    })
    this.mountServiceCharacteristic({
      endpoint: 2,
      cluster: 'genAnalogInput',
      service: 'Outlet',
      characteristic: 'OutletInUse',
      reportMinInt: 1,
      reportMaxInt: 300,
      reportChange: 1,
      report: 'presentValue',
      reportParser: data => data > 0,
    })
  }

  handlePowerReport(data) {
    this.log('handlePowerReport', data)
  }

  // handleMeterPowerReport(data) {
  //   this.log('handleMeterPowerReport', data)
  // }

  // handleLifelineReport(data) {
  //   this.log('handleLifelineReport:', JSON.stringify(parseXiaomiStruct(data)))
  // }
}

module.exports = AqaraPlug

const HomeKitDevice = require('../HomeKitDevice')
const { XIAOMI_STRUCT_ATTR, updateXiaomiButteryCharacteristics } = require('../utils/xiaomi')

const ALARM_MOTION_RESET_WINDOW = 180 // Should be configurable outside

class AqaraHumanBodySensor extends HomeKitDevice {
  constructor(data) {
    super({ model: 'lumi.sensor_motion.aq2', manufacturer: 'Aqara', ...data })
  }

  getAvailbleServices() {
    return [{
      name: 'Motion',
      type: this.Service.MotionSensor,
    }, {
      name: 'Light',
      type: this.Service.LightSensor,
    }, {
      name: 'Battery',
      type: this.Service.BatteryService,
    }]
  }

  onDeviceReady() {
    this.zigbee.update({ status: 'online', joinTime: Math.floor(Date.now() / 1000) })
    this.zigbee.subscribe(1, 'msOccupancySensing', 'occupancy', 1, 60, 1, this.handleOccupancyReport.bind(this))
    this.zigbee.subscribe(1, 'msIlluminanceMeasurement', 'measuredValue', 1, 60, 1, this.handleIlluminanceReport.bind(this))
    this.zigbee.subscribe(1, 'genBasic', XIAOMI_STRUCT_ATTR, 1, 60, null, this.handleLifelineReport.bind(this))
  }

  handleOccupancyReport(data) {
    const characteristic = this.getServiceCharacteristic('Motion', this.Characteristic.MotionDetected)
    // Set and clear motion timeout
    clearTimeout(this.motionTimeout)
		this.motionTimeout = setTimeout(() => {
      // Reset characteristic
			characteristic.updateValue(false)
		}, ALARM_MOTION_RESET_WINDOW * 1000)
		// Update characteristic
		characteristic.updateValue(data === 1)
  }

  handleIlluminanceReport(data) {
    const characteristic = this.getServiceCharacteristic('Light', this.Characteristic.CurrentAmbientLightLevel)
    characteristic.updateValue(data)
  }

  handleLifelineReport(data) {
    updateXiaomiButteryCharacteristics(this, data)
  }
}

module.exports = AqaraHumanBodySensor

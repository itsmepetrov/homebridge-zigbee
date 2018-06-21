const pkg = require('../package.json')
const zigbee = require('./zigbee')

class PermitJoinAccessory {
  constructor({ accessory, platform, log, ...rest }) {
    // Current progress status
    this.inProgress = false
    // Permit join timeout
    this.timeout = platform.config.permitJoinTimeout || 120
    // Save HomeKit props
    this.Accessory = rest.Accessory
    this.Service = rest.Service
    this.Characteristic = rest.Characteristic
    this.UUIDGen = rest.UUIDGen
    // Save platform
    this.platform = platform
    // Save logger
    this.log = log
    // Verify accessory
    if (accessory) {
      this.accessory = accessory
    } else {
      const serialNumber = Math.random().toString(36).substr(2, 10);
      const accessoryName = 'zigbee:permit-join'
      const uuid = this.UUIDGen.generate(accessoryName)
      this.accessory = new this.Accessory(accessoryName, uuid)
      this.accessory.getService(this.Service.AccessoryInformation)
        .setCharacteristic(this.Characteristic.Manufacturer, pkg.author.name)
        .setCharacteristic(this.Characteristic.Model, pkg.name)
        .setCharacteristic(this.Characteristic.SerialNumber, serialNumber)
        .setCharacteristic(this.Characteristic.FirmwareRevision, pkg.version)
      this.accessory.addService(new this.Service.Switch('Permit Join'))
      this.platform.registerAccessory(this.accessory)
    }
    this.accessory.updateReachability()
    this.accessory.on('identify', this.handleAccessoryIdentify)
    this.onDeviceReady()
  }

  handleAccessoryIdentify(paired, callback) {
    callback()
  }

  getSwitchCharacteristic() {
    return this.accessory.getService(this.Service.Switch).getCharacteristic(this.Characteristic.On)
  }

  onDeviceReady() {
    const characteristic = this.getSwitchCharacteristic()
    zigbee.on('permitJoining', this.handlePermitJoin.bind(this))
    characteristic.on('get', this.handleGetSwitchOn.bind(this))
    characteristic.on('set', this.handleSetSwitchOn.bind(this))
  }

  handleGetSwitchOn(callback) {
    callback(null, this.inProgress)
  }

  handleSetSwitchOn(value, callback) {
    this.log(value ? 'start' : 'stop')
    zigbee.permitJoin(value ? this.timeout : 0, (error) => {
      if (error) {
        this.log('error:', error)
      }
      callback(error)
    })
  }

  handlePermitJoin(joinTimeLeft) {
    this.log('time left:', joinTimeLeft)
    const currentStatus = !!joinTimeLeft
    if (this.inProgress !== currentStatus) {
      this.inProgress = currentStatus
      this.getSwitchCharacteristic().updateValue(currentStatus)
    }
  }
}

module.exports = PermitJoinAccessory

const ZigBeeDevice = require('./ZigBeeDevice')

class HomeKitDevice {
  constructor({ model, manufacturer, ieeeAddr, accessory, platform, log, ...rest }) {
    // Create ZigBee device instance
    this.zigbee = new ZigBeeDevice({ model, ieeeAddr, log })
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
      const accessoryName = `${model}:${ieeeAddr}`
      const uuid = this.UUIDGen.generate(ieeeAddr)
      this.accessory = new this.Accessory(accessoryName, uuid)
      this.accessory.getService(this.Service.AccessoryInformation)
        .setCharacteristic(this.Characteristic.Manufacturer, manufacturer)
        .setCharacteristic(this.Characteristic.Model, model)
        .setCharacteristic(this.Characteristic.SerialNumber, ieeeAddr)
      this.getAvailbleServices().forEach(service => {
        this.accessory.addService(new service.type(service.name, service.subtype))
      })
      this.platform.registerAccessory(this.accessory)
    }
    this.accessory.updateReachability()
    this.accessory.on('identify', this.handleAccessoryIdentify)
    this.log(`Registered device: ${model} ${ieeeAddr}`)
    this.onDeviceReady()
  }

  handleAccessoryIdentify(paired, callback) {
    callback()
  }

  getService(service) {
    return this.accessory.getService(service)
  }

  getServiceCharacteristic(service, characteristic) {
    return this.accessory.getService(service).getCharacteristic(characteristic)
  }

  getServiceSubtypeCharacteristic(service, subtype, characteristic) {
    return this.accessory.getServiceByUUIDAndSubType(service, subtype).getCharacteristic(characteristic)
  }

  // getAvailbleServices() {
  //   return [{
  //     name: 'Test Bulb',
  //     type: this.Service.Lightbulb,
  //   }]
  // }

  // onDeviceReady() {
  //   this.log('Put your code here')
  // }
}

module.exports = HomeKitDevice

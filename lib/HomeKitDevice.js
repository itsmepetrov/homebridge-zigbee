const requireDir = require('require-dir')
const ZigBeeDevice = require('./ZigBeeDevice')
const parsers = requireDir('./parsers')

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
        const Service = this.parseService(service.type)
        this.accessory.addService(new Service(service.name, service.subtype))
      })
      this.platform.registerAccessory(this.accessory)
    }
    this.accessory.updateReachability()
    this.accessory.on('identify', this.handleAccessoryIdentify)
    this.onDeviceReady()
  }

  handleAccessoryIdentify(paired, callback) {
    callback()
  }

  parseService(service) {
    if (typeof service === 'function') {
      return service
    } else {
      return this.Service[service]
    }
  }

  parseCharacteristic(characteristic) {
    if (typeof characteristic === 'function') {
      return characteristic
    } else {
      return this.Characteristic[characteristic]
    }
  }

  getService(service) {
    return this.accessory.getService(service)
  }

  getServiceCharacteristic(service, characteristic) {
    return this.getService(service).getCharacteristic(this.parseCharacteristic(characteristic))
  }

  getServiceSubtypeCharacteristic(service, subtype, characteristic) {
    return this.accessory.getServiceByUUIDAndSubType(service, subtype).getCharacteristic(this.parseCharacteristic(characteristic))
  }

  mountServiceCharacteristic({ endpoint, cluster, service, characteristic, ...options }) {    
    const serviceCharacteristic = this.getServiceCharacteristic(service, characteristic)
    const parser = Object.assign({}, parsers[options.parser], options)
    if (parser.report) {
      this.zigbee.subscribe(endpoint, cluster, parser.report, parser.reportMinInt, parser.reportMaxInt, parser.reportChange, (data) => {
        serviceCharacteristic.updateValue(parser.reportParser(data, this, serviceCharacteristic))
      })
    }
    if (parser.get) {
      serviceCharacteristic.on('get', (callback) => {
        this.zigbee.read(endpoint, cluster, parser.get, (err, data) => {
          callback(err, parser.getParser(data, this, serviceCharacteristic))
        })
      })
    }
    if (parser.set) {
      serviceCharacteristic.on('set', (value, callback) => {
        this.zigbee.publish(endpoint, cluster, parser.set(value, this), parser.setParser(value, this, serviceCharacteristic))
        callback()
      })
    }
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
const requireDir = require('require-dir')
const isEmpty = require('./utils/isEmpty')
const ZigBeeDevice = require('./ZigBeeDevice')

const parsers = requireDir('./parsers')

class HomeKitDevice {
  constructor({ name, model, manufacturer, ieeeAddr, accessory, platform, log, ...rest }) {
    // Create ZigBee device instance
    this.zigbee = new ZigBeeDevice({ model, ieeeAddr, log })
    // Save ieeeAddr as the id of device
    this.ieeeAddr = ieeeAddr
    // Save accessory name
    this.name = name
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
      const uuid = this.UUIDGen.generate(ieeeAddr)
      this.accessory = new this.Accessory(name, uuid)
      this.accessory.getService(this.Service.AccessoryInformation)
        .setCharacteristic(this.Characteristic.Manufacturer, manufacturer)
        .setCharacteristic(this.Characteristic.Model, model)
        .setCharacteristic(this.Characteristic.SerialNumber, ieeeAddr)
      this.getAvailbleServices().forEach((service) => {
        const Service = this.parseServiceType(service.type)
        this.accessory.addService(new Service(this.parseServiceName(service.name), service.subtype))
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

  parseServiceType(service) {
    if (typeof service === 'function') {
      return service
    }
    return this.Service[service]
  }

  parseServiceName(name) {
    if (typeof name === 'function') {
      return name
    }
    return `${this.name}: ${name}`
  }

  parseCharacteristic(characteristic) {
    if (typeof characteristic === 'function') {
      return characteristic
    }
    return this.Characteristic[characteristic]
  }

  getService(service) {
    return this.accessory.getService(this.parseServiceName(service))
  }

  getServiceCharacteristic(service, characteristic) {
    return this.getService(service)
      .getCharacteristic(this.parseCharacteristic(characteristic))
  }

  getServiceSubtypeCharacteristic(service, subtype, characteristic) {
    return this.accessory
      .getServiceByUUIDAndSubType(this.parseServiceName(service), subtype)
      .getCharacteristic(this.parseCharacteristic(characteristic))
  }

  mountServiceCharacteristic({ endpoint, cluster, service, characteristic, ...options }) {
    const serviceCharacteristic = this.getServiceCharacteristic(service, characteristic)
    const parser = Object.assign({}, parsers[options.parser], options)
    if (parser.report) {
      this.zigbee.subscribe(
        endpoint,
        cluster,
        parser.report,
        parser.reportMinInt,
        parser.reportMaxInt,
        parser.reportChange,
        (data) => {
          const value = parser.reportParser(data, this, serviceCharacteristic)
          if (!isEmpty(value)) {
            serviceCharacteristic.updateValue(value)
          }
        }
      )
    }
    if (parser.get) {
      serviceCharacteristic.on('get', (callback) => {
        this.zigbee.read(
          endpoint,
          cluster,
          parser.get,
          (err, data) => {
            callback(err, parser.getParser(data, this, serviceCharacteristic))
          }
        )
      })
    }
    if (parser.set) {
      serviceCharacteristic.on('set', (value, callback) => {
        this.zigbee.publish(
          endpoint,
          cluster,
          parser.set(value, this),
          parser.setParser(value, this, serviceCharacteristic)
        )
        callback() // Don't wait response
      })
    }
  }

  unstableStatusMountServiceCharacteristic(
    { endpoint, cluster, service, characteristic, ...options }
  ) {
    const serviceCharacteristic = this.getServiceCharacteristic(service, characteristic)
    const parser = Object.assign({}, parsers[options.parser], options)
    if (parser.status) {
      this.zigbee.unstableStatusSubscribe(endpoint, cluster, parser.status, (data) => {
        serviceCharacteristic.updateValue(parser.statusParser(data, this, serviceCharacteristic))
      })
    }
  }

  // Must be overriden
  getAvailbleServices() {
    throw new Error('HomeKitDevice.getAvailbleServices() must be overriden')
  }

  onDeviceReady() {
    throw new Error('HomeKitDevice.onDeviceReady() must be overriden')
  }
}

module.exports = HomeKitDevice

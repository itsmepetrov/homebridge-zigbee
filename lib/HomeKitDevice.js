const nanoid = require('nanoid')
const requireDir = require('require-dir')
const isEmpty = require('./utils/isEmpty')
const ZigBeeDevice = require('./ZigBeeDevice')
const historyService = require('./services/history')
const setupService = require('./services/setup')

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
    // Device timeouts
    this.timeouts = {}
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
      this.platform.registerAccessory(this.accessory)
    }
    this.addServices([
      ...this.getAvailbleServices(),
      ...this.getCustomServices(),
    ])
    setupService.mount(this)
    historyService.mount(this)
    this.accessory.updateReachability()
    this.accessory.on('identify', this.handleAccessoryIdentify)
    this.onDeviceReady()
  }

  handleAccessoryIdentify(paired, callback) {
    callback()
  }

  addServices(items) {
    const infoService = this.accessory.getService(this.Service.AccessoryInformation)
    const oldServices = this.accessory.services.filter(service => service !== infoService)
    const newServices = []
    // Collect new services
    for (const item of items) {
      const oldService = this.getServiceSubtype(item.name, item.subtype)
      if (oldService && oldService.UUID === this.parseServiceType(item.type).UUID) {
        newServices.push(oldService)
      } else {
        newServices.push(this.createService(item.name, item.type, item.subtype))
      }
    }
    // Collect history services
    for (const item of historyService.getHistoryServices(items)) {
      newServices.push(historyService.createService(this, item.name, item.type))
    }
    // Remove outdated services
    for (const service of oldServices) {
      this.accessory.removeService(service)
    }
    // Add new services
    for (const service of newServices) {
      this.accessory.addService(service)
    }
  }

  addCharacteristicIfDoesNotExist(service, characteristic, optional = false) {
    const target = this.parseCharacteristic(characteristic)
    if (!service.testCharacteristic(target)) {
      if (optional) {
        service.addOptionalCharacteristic(target)
      } else {
        service.addCharacteristic(target)
      }
    }
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
    return `${this.name} ${name}`
  }

  parseCharacteristic(characteristic) {
    if (typeof characteristic === 'function') {
      return characteristic
    }
    console.log('charac')
    console.log(this.Characteristic)
    return this.Characteristic[characteristic]
  }

  createService(name, type, subtype) {
    const Service = this.parseServiceType(type)
    return new Service(this.parseServiceName(name), subtype)
  }

  getService(service) {
    return this.accessory.getService(this.parseServiceName(service))
  }

  getServiceCharacteristic(service, characteristic) {
    return this.getService(service)
      .getCharacteristic(this.parseCharacteristic(characteristic))
  }

  getServiceSubtype(service, subtype) {
    return this.accessory
      .getServiceByUUIDAndSubType(this.parseServiceName(service), subtype)
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
      const getPropertyValue = (callback) => {
        this.zigbee.read(endpoint, cluster, parser.get, callback)
      }
      serviceCharacteristic.on('get', (callback) => {
        getPropertyValue((err, data) => {
          if (parser.getWaitResponse) {
            callback(err, parser.getParser(data, this, serviceCharacteristic))
          } else if (!err) {
            serviceCharacteristic.updateValue(parser.getParser(data, this, serviceCharacteristic))
          }
        })
        if (!parser.getWaitResponse) {
          callback(null, serviceCharacteristic.value) // Don't wait response
        }
      })
      if (parser.getRequestOnStart) {
        getPropertyValue((err, data) => {
          if (!err) {
            serviceCharacteristic.updateValue(parser.getParser(data, this, serviceCharacteristic))
          }
        })
      }
    }
    if (parser.set) {
      serviceCharacteristic.on('set', (value, callback) => {
        this.zigbee.publish(
          endpoint,
          cluster,
          parser.set(value, this),
          parser.setParser(value, this, serviceCharacteristic),
          (err, data) => {
            if (parser.setWaitResponse) {
              callback(err, data)
            }
          }
        )
        if (!parser.setWaitResponse) {
          callback() // Don't wait response
        }
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

  setTimeout(callback, timeout) {
    const timeoutId = nanoid()
    this.timeouts[timeoutId] = setTimeout(callback, timeout)
    return timeoutId
  }

  clearTimeout(timeoutId) {
    clearTimeout(this.timeouts[timeoutId])
    delete this.timeouts[timeoutId]
  }

  clearTimeouts() {
    for (const timeoutId of Object.keys(this.timeouts)) {
      this.clearTimeout(timeoutId)
    }
  }

  getCustomServices() {
    return [{
      name: 'Setup',
      type: 'Setup',
    }]
  }

  // Must be overriden
  getAvailbleServices() {
    throw new Error('HomeKitDevice.getAvailbleServices() must be overriden')
  }

  // Must be overriden
  onDeviceReady() {
    throw new Error('HomeKitDevice.onDeviceReady() must be overriden')
  }

  unregister() {
    this.clearTimeouts()
  }
}

module.exports = HomeKitDevice

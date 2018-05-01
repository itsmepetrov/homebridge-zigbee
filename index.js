const requireDir = require('require-dir')
const zigbee = require('./lib/zigbee')
const castArray = require('./lib/utils/castArray')
const findSerialPort = require('./lib/utils/findSerialPort')
const devices = Object.values(requireDir('./lib/devices'))

let Accessory, Service, Characteristic, UUIDGen

module.exports = function(homebridge) {
  Accessory = homebridge.platformAccessory
  Service = homebridge.hap.Service
  Characteristic = homebridge.hap.Characteristic
  UUIDGen = homebridge.hap.uuid
  homebridge.registerPlatform('homebridge-zigbee', 'ZigBeePlatform', ZigBeePlatform, true)
}

class ZigBeePlatform {
  constructor(log, config, api) {
    this.log = log
    this.api = api
    this.config = config
    this.devices = {}
    this.accessories = {}

    // Bind handlers
    this.handleZigBeeStart = this.handleZigBeeStart.bind(this)
    this.handleZigBeeError = this.handleZigBeeError.bind(this)
    this.handleZigBeeReady = this.handleZigBeeReady.bind(this)
    this.configureAccessory = this.configureAccessory.bind(this)
    this.handleInitialization = this.handleInitialization.bind(this)

    // Listen events
    this.api.on('didFinishLaunching', this.handleInitialization)

    this.log('ZigBee platform initialization')
  }

  handleInitialization() {
    this.startZigBee()
  }

  async startZigBee() {
    zigbee.init({
      port: this.config.port || await findSerialPort(),
      db: this.config.database || './shepherd.db',
    })
    zigbee.on('ready', this.handleZigBeeReady)
    zigbee.on('error', this.handleZigBeeError)
    zigbee.start(this.handleZigBeeStart)
  }

  handleZigBeeStart(error) {
    if (error) {
      this.log('[ZigBee:ready] error:', error)
    }
  }

  handleZigBeeError(error) {
    this.log('[ZigBee:error] error:', error)
  }

  handleZigBeeReady() {
    zigbee.list().forEach(
      data => this.initDevice(data)
    )
  }

  setDevice(device) {
    this.devices[device.accessory.UUID] = device
  }

  getDevice(uuid) {
    return this.devices[uuid]
  }

  setAccessory(accessory) {
    this.accessories[accessory.UUID] = accessory
  }

  getAccessory(uuid) {
    return this.accessories[uuid]
  }

  registerAccessory(accessory) {
    this.setAccessory(accessory)
    this.api.registerPlatformAccessories('homebridge-zigbee', 'ZigBeePlatform', [accessory])
  }

  recognizeDevice({ model, manufacturer }) {
    for (let Device of devices) {
      if (!Device.description) {
        continue
      }
      const description = Device.description()
      if (
        castArray(description.model).includes(model) &&
        castArray(description.manufacturer).includes(manufacturer)
      ) {
        return Device
      }
    }
  }

  initDevice(data) {
    const platform = this
    const model = data.modelId
    const manufacturer = data.manufName
    const ieeeAddr = data.ieeeAddr
    const uuid = UUIDGen.generate(ieeeAddr)
    const accessory = this.getAccessory(uuid)
    const log = (...args) => this.log(manufacturer, model, ieeeAddr, ...args)
    const Device = this.recognizeDevice({ model, manufacturer })

    if (!Device) {
      return this.log('Unrecognized device:', manufacturer, model, ieeeAddr)
    }

    const device = new Device({
      model,
      manufacturer,
      ieeeAddr,
      accessory,
      platform,
      log,
      Accessory,
      Service,
      Characteristic,
      UUIDGen,
    })
  
    this.setDevice(device)
    this.log('Registered device:', manufacturer, model, ieeeAddr)
  }

  configureAccessory(accessory) {
    this.setAccessory(accessory)
  }

  removeAccessory() {
    this.log('removeAccessory is not implemented yet')
  }
}

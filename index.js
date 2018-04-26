const requireDir = require('require-dir')
const zigbee = require('./lib/zigbee')
const devices = requireDir('./lib/devices')

const PORT = '/dev/tty.usbmodem14414221'

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

  startZigBee() {
    zigbee.init({
      port: this.config.port,
      db: this.config.database || './shepherd.db',
    })
    zigbee.on('ready', this.handleZigBeeReady)
    zigbee.start(this.handleZigBeeStart)
  }

  handleZigBeeStart(error) {
    if (error) {
      this.log('ZigBee error:', error)
    }
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

  initDevice(data) {
    const log = this.log
    const platform = this
    const model = data.modelId
    const ieeeAddr = data.ieeeAddr
    const epList = data.epList
    const uuid = UUIDGen.generate(ieeeAddr)
    const accessory = this.getAccessory(uuid)
    const Device = devices[model]

    if (!Device) {
      return this.log('Unrecognized device:', model);
    }

    const device = new Device({
      model,
      ieeeAddr,
      epList,
      accessory,
      platform,
      log,
      Accessory,
      Service,
      Characteristic,
      UUIDGen,
    })
  
    this.setDevice(device)
  }

  configureAccessory(accessory) {
    this.setAccessory(accessory)
  }

  removeAccessory() {
    this.log('removeAccessory is not implemented yet')
  }
}
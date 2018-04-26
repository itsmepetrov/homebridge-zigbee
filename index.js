const zigbee = require('./lib/zigbee')

const PORT = '/dev/tty.usbmodem1461'

let PlatformAccessory, Accessory, Service, Characteristic, UUIDGen

module.exports = function(homebridge) {
  PlatformAccessory = homebridge.platformAccessory
  Accessory = homebridge.hap.Accessory
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
      port: PORT,
      db: './shepherd.db',
    })
    zigbee.on('ready', this.handleZigBeeReady)
    zigbee.start(this.handleZigBeeStart)
  }

  handleZigBeeStart(error) {
    if (error) {
      console.error('ZigBee error:', error)
    }
  }

  handleZigBeeReady() {
    const list = zigbee.list()
    console.log('devices:', list)
  }

  configureAccessory() {}

  removeAccessory() {}
}
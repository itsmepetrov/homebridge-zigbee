const get = require('lodash.get');
const requireDir = require('require-dir')
const zigbee = require('./lib/zigbee')
const sleep = require('./lib/utils/sleep')
const castArray = require('./lib/utils/castArray')
const findSerialPort = require('./lib/utils/findSerialPort')
const PermitJoinAccessory = require('./lib/PermitJoinAccessory');
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
    this.permitJoinAccessory = null

    // Bind handlers
    this.handleZigBeeStart = this.handleZigBeeStart.bind(this)
    this.handleZigBeeError = this.handleZigBeeError.bind(this)
    this.handleZigBeeReady = this.handleZigBeeReady.bind(this)
    this.handleZigBeeIndication = this.handleZigBeeIndication.bind(this)
    this.handleInitialization = this.handleInitialization.bind(this)
    this.configureAccessory = this.configureAccessory.bind(this)

    // Listen events
    this.api.on('didFinishLaunching', this.handleInitialization)

    this.log('ZigBee platform initialization')
  }

  handleInitialization() {
    this.startZigBee().catch(this.log)
  }

  async startZigBee() {
    zigbee.init({
      port: this.config.port || await findSerialPort(),
      db: this.config.database || './shepherd.db',
    })
    zigbee.on('ready', this.handleZigBeeReady)
    zigbee.on('error', this.handleZigBeeError)
    zigbee.on('ind', this.handleZigBeeIndication)
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

  handleZigBeeIndication(message) {
    switch (message.type) {
      // Supported indication messages
      case 'attReport':
      case 'statusChange':
        return this.handleZigBeeAttrChange(message)
      case 'devInterview':
        return this.handleZigBeeDevInterview(message)
      case 'devIncoming':
        return this.handleZigBeeDevIncoming(message)
      case 'devLeaving':
        return this.handleZigBeeDevLeaving(message)
      default:
        return
    }
  }

  handleZigBeeAttrChange(message) {
    const ieeeAddr = get(message, 'endpoints[0].device.ieeeAddr')

    if (!ieeeAddr) {
      return this.log('Unable to parse device ieeeAddr from message:', message)
    }

    const device = this.getDevice(ieeeAddr)

    if (!device) {
      return this.log('Received message from unknown device:', ieeeAddr)
    }

    device.zigbee.handleIndicationMessage(message)
  }

  handleZigBeeDevInterview(message) {
    const endpoint = get(message, 'status.endpoint.current')
    const endpointTotal = get(message, 'status.endpoint.total')
    const cluster = get(message, 'status.endpoint.cluster.current')
    const clusterTotal = get(message, 'status.endpoint.cluster.total')
    this.log(`Join progress: interview endpoint ${endpoint} of ${endpointTotal} and cluster ${cluster} of ${clusterTotal}`)
  }

  async handleZigBeeDevIncoming(message) {
    const ieeeAddr = message.data
    // Stop permit join
    this.permitJoinAccessory.setPermitJoin(false)
    this.log(`Device announced incoming and is added, id: ${ieeeAddr}`)
    // Ignore if the device exists
    if (!this.getDevice(ieeeAddr)) {
      // Wait a little bit for a database sync
      await sleep(1500)
      const data = zigbee.device(ieeeAddr)
      this.initDevice(data)
    }
  }

  handleZigBeeDevLeaving(message) {
    const ieeeAddr = message.data
    // Stop permit join
    this.permitJoinAccessory.setPermitJoin(false)
    this.log(`Device announced leaving and is removed, id: ${ieeeAddr}`)
    const uuid = UUIDGen.generate(ieeeAddr)
    const accessory = this.getAccessory(uuid)
    // Sometimes we can unpair device which doesn't exist in HomeKit
    if (accessory) {
      this.api.unregisterPlatformAccessories('homebridge-zigbee', 'ZigBeePlatform', [accessory])
      delete this.devices[ieeeAddr]
      delete this.accessories[uuid]
    }
  }

  async handleZigBeeReady() {
    this.log('[ZigBee:ready] ZigBee initialized')
    // Wait a little bit before device initialization to avoid timeout error
    await sleep(2000)
    this.initPermitJoinAccessory()
    zigbee.list().forEach(data => this.initDevice(data))
  }

  setDevice(device) {
    this.devices[device.ieeeAddr] = device
  }

  getDevice(ieeeAddr) {
    return this.devices[ieeeAddr]
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

  initPermitJoinAccessory() {
    const platform = this
    const uuid = UUIDGen.generate('zigbee:permit-join')
    const accessory = this.getAccessory(uuid)
    const log = (...args) => this.log('[PermitJoinAccessory]', ...args)
    this.permitJoinAccessory = new PermitJoinAccessory({
      accessory,
      platform,
      log,
      Accessory,
      Service,
      Characteristic,
      UUIDGen,
    })
  }

  configureAccessory(accessory) {
    this.setAccessory(accessory)
  }

  removeAccessory() {
    this.log('removeAccessory is not implemented yet')
  }
}

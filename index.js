const path = require('path')
const get = require('lodash.get')
const retry = require('async-retry')
const requireDir = require('require-dir')
const zigbee = require('./lib/zigbee')
const sleep = require('./lib/utils/sleep')
const castArray = require('./lib/utils/castArray')
const parseModel = require('./lib/utils/parseModel')
const routerPolling = require('./lib/utils/routerPolling')
const findSerialPort = require('./lib/utils/findSerialPort')
const PermitJoinAccessory = require('./lib/PermitJoinAccessory')

const devices = Object.values(requireDir('./lib/devices'))

// Only for beta period
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception', error) // eslint-disable-line no-console
})
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection', reason) // eslint-disable-line no-console
})

// eslint-disable-next-line one-var, one-var-declaration-per-line
let Accessory, Service, Characteristic, UUIDGen

module.exports = function main(homebridge) {
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
      db: this.config.database || path.join(this.api.user.storagePath(), './zigbee.db'),
      panId: this.config.panId || 0xFFFF,
      channel: this.config.channel || 11,
    })

    zigbee.on('ready', this.handleZigBeeReady)
    zigbee.on('error', this.handleZigBeeError)
    zigbee.on('ind', this.handleZigBeeIndication)

    const retrier = async () => {
      try {
        await zigbee.start()
      } catch (error) {
        await zigbee.stop()
        throw error
      }
    }

    try {
      await retry(retrier, {
        retries: 20,
        minTimeout: 5000,
        maxTimeout: 5000,
        onRetry: () => this.log('Retrying connect to hardware'),
      })
    } catch (error) {
      this.log('error:', error)
    }
  }

  handleZigBeeError(error) {
    this.log('error:', error)
  }

  handleZigBeeIndication(message) { // eslint-disable-line consistent-return
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
        // Do nothing
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
    this.log(
      `Join progress: interview endpoint ${endpoint} of ${endpointTotal} `
      + `and cluster ${cluster} of ${clusterTotal}`
    )
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
    const info = zigbee.info()
    this.log('ZigBee platform initialized, info:')
    this.log('------------------------------------')
    this.log('channel:', info.net.channel)
    this.log('pan id:', info.net.panId)
    this.log('extended pan id:', info.net.extPanId)
    this.log('ieee address:', info.net.ieeeAddr)
    this.log('nwk address:', info.net.nwkAddr)
    this.log('firmware version:', info.firmware.version)
    this.log('firmware revision:', info.firmware.revision)
    this.log('------------------------------------')
    // Set led indicator
    zigbee.request('UTIL', 'ledControl', {
      ledid: 3, mode: this.config.disableLed ? 0 : 1,
    })
    // Init permit join accessory
    this.initPermitJoinAccessory()
    // Init devices
    zigbee.list().forEach(data => this.initDevice(data))
    // Init log for router polling service
    if (!this.config.disablePingLog) {
      routerPolling.log = this.log
    }
    // Some routers need polling to prevent them from sleeping.
    routerPolling.start(this.config.routerPollingInterval)
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
    for (const Device of devices) {
      if (!Device.description) {
        continue // eslint-disable-line no-continue
      }
      if (
        castArray(Device.description.model).includes(model)
        && castArray(Device.description.manufacturer).includes(manufacturer)
      ) {
        return Device
      }
    }
  }

  initDevice(data) {
    try {
      const platform = this
      const model = parseModel(data.modelId)
      const manufacturer = data.manufName
      const ieeeAddr = data.ieeeAddr
      const uuid = UUIDGen.generate(ieeeAddr)
      const accessory = this.getAccessory(uuid)
      const log = (...args) => this.log(manufacturer, model, ieeeAddr, ...args)
      const Device = this.recognizeDevice({ model, manufacturer })
      const name = get(Device, 'description.name')

      if (!Device) {
        return this.log('Unrecognized device:', ieeeAddr, manufacturer, model)
      }

      const device = new Device({
        name,
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
      this.log('Registered device:', ieeeAddr, manufacturer, model)
    } catch (error) {
      this.log(
        `Unable to initialize device ${data && data.ieeeAddr}, `
        + 'try to remove it and add it again.\n')
      this.log('Reason:', error)
    }
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

const ZShepherd = require('zigbee-shepherd')
const promisify = require('./utils/promisify')

class ZigBee {
  constructor() {
    this.shepherd = null
  }

  init(config) {
    this.shepherd = new ZShepherd(config.port, {
      net: { panId: config.panId },
      sp: { baudRate: 115200, rtscts: true },
      channelList: config.channels,
      dbPath: config.db,
    })
  }

  start() {
    return promisify(this.shepherd.start.bind(this.shepherd))
  }

  stop() {
    return promisify(this.shepherd.stop.bind(this.shepherd))
  }

  info() {
    return this.shepherd.info()
  }

  coordinator() {
    return this.shepherd.list()[0]
  }

  list() {
    return this.shepherd.list().slice(1) // Remove coordinator from list
  }

  device(addr) {
    return this.list().find(
      device => device.ieeeAddr === addr
    )
  }

  endpoints(addr) {
    return this.device(addr).epList.map(
      endpoint => this.find(addr, endpoint)
    )
  }

  find(addr, epId) {
    return this.shepherd.find(addr, epId)
  }

  ping(addr) {
    const device = this.shepherd._findDevByAddr(addr) // eslint-disable-line no-underscore-dangle
    if (device) {
      return this.shepherd.controller.checkOnline(device)
    }
  }

  permitJoin(timeout, callback) {
    return this.shepherd.permitJoin(timeout, callback)
  }

  on(type, callback) {
    return this.shepherd.on(type, callback)
  }
}

module.exports = new ZigBee()

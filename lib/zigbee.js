const ZShepherd = require('zigbee-shepherd')

const PORT = '/dev/tty.usbmodem14621'

class ZigBee {
  constructor() {
    this.shepherd = null
  }

  init(config) {
    this.shepherd = new ZShepherd(config.port, {
      net: { panId: 0x1a62 },
      sp: { baudrate: 115200, rtscts: false },
      dbPath: config.db,
    })
  }

  start(callback) {
    return this.shepherd.start(callback)
  }

  list() {
    return this.shepherd.list()
  }

  find(addr, epId) {
    return this.shepherd.find(addr, epId)
  }

  permitJoin(timeout, callback) {
    return this.shepherd.permitJoin(timeout, callback)
  }

  on(type, callback) {
    return this.shepherd.on(type, callback)
  }
}

module.exports = new ZigBee()

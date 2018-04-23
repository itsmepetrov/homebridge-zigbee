const requireDir = require('require-dir')
const devices = requireDir('./devices')

class Manager {
  constructor() {
    this.devices = {};
  }

  init(list) {
    list.forEach(item => this.initDevice(item))
  }

  initDevice(item) {
    const Device = devices[item.modelId];
    if (Device) {
      console.log('[manager] init device:', item.modelId);
      this.devices[item.ieeeAddr] = new Device(item)
    } else {
      console.log('[manager] unrecognized device:', item.modelId);
    }
  }
}

module.exports = new Manager()

const strftime = require('strftime');
const zigbee = require('./zigbee')

function parseAttrId(attrId) {
  if (typeof attrId === 'object') {
    return attrId.id
  } else {
    return attrId
  }
}

class ZigBeeDevice {
  constructor(data) {
    this.id = data.ieeeAddr
    this.modelId = data.modelId
    this.status = data.status
    this.endpoints = data.epList.map(
      ep => zigbee.find(this.id, ep)
    )
    this.subscriptions = {}
    
    zigbee.on('ind', this.handleIndicationMessage.bind(this))

    this.ready()
  }

  log(...args) {
    console.log(`[${strftime('%Y-%m-%d %H:%M:%S', new Date())}] ${this.modelId} ${this.id}:`, ...args)
  }

  ready() {
    console.log(`Device ${this.id} (${this.modelId}) is ready`)
  }

  endpoint(id) {
    return this.endpoints.find(item => item.epId === id)
  }

  update(data) {
    return this.endpoints[0].getDevice().update(data)
  }

  subscribe(endpointId, clusterId, attrId, minInt, maxInt, repChange, callback) {
    if (repChange) {
      this.endpoint(endpointId).report(clusterId, attrId, minInt, maxInt, repChange, () => {})
    } else {
      this.endpoint(endpointId).report(clusterId, attrId, minInt, maxInt, () => {})
    }

    this.subscriptions[`${endpointId}_${clusterId}_${parseAttrId(attrId)}`] = callback
  }

  handleIndicationMessage(message) {
    switch (message.type) {
      case 'attReport':
        return this.handleReport(message)
      default:
        return
    }
  }

  handleReport(message) {
    const id = message.endpoints[0].device.ieeeAddr

    if (this.id !== id) {
      return
    }

    const endpointId = message.endpoints[0].epId
    const clusterId = message.data.cid
    const attrIds = Object.keys(message.data.data)
    
    attrIds.forEach(attrId => {
      const callback = this.subscriptions[`${endpointId}_${clusterId}_${attrId}`]

      if (callback) {
        callback(message.data.data[attrId])
      }
    })
  }
}

module.exports = ZigBeeDevice

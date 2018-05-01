const zigbee = require('./zigbee')
const parseAttrId = require('./utils/parseAttrId')

class ZigBeeDevice {
  constructor({ ieeeAddr, log }) {
    const device = zigbee.device(ieeeAddr)
    this.modelId = device.modelId
    this.ieeeAddr = device.ieeeAddr
    this.endpoints = zigbee.endpoints(ieeeAddr)
    this.subscriptions = {}
    this.log = log
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
    this.subscriptions[`report_${endpointId}_${clusterId}_${parseAttrId(attrId)}`] = callback
  }

  unstableStatusSubscribe(endpointId, clusterId, attrId, callback) {
    this.subscriptions[`status_${endpointId}_${clusterId}_${parseAttrId(attrId)}`] = callback
  }

  publish(endpointId, clusterId, attrId, data, callback) {
    return this.endpoint(endpointId).functional(clusterId, parseAttrId(attrId), data, callback)
  }

  read(endpointId, clusterId, attrId, callback) {
    return this.endpoint(endpointId).read(clusterId, parseAttrId(attrId), callback)
  }

  handleIndicationMessage(message) {
    switch (message.type) {
      case 'attReport':
        return this.handleReport(message)
      case 'statusChange':
        return this.handleStatus(message)
      default:
        return
    }
  }

  handleReport(message) {
    const endpointId = message.endpoints[0].epId
    const clusterId = message.data.cid
    const attrIds = Object.keys(message.data.data)
    
    attrIds.forEach(attrId => {
      const callback = this.subscriptions[`report_${endpointId}_${clusterId}_${attrId}`]

      if (callback) {
        callback(message.data.data[attrId])
      }
    })
  }

  handleStatus(message) {
    const endpointId = message.endpoints[0].epId
    const clusterId = message.data.cid
    const attrIds = Object.keys(message.data)
    
    attrIds.forEach(attrId => {
      const callback = this.subscriptions[`status_${endpointId}_${clusterId}_${attrId}`]

      if (callback) {
        callback(message.data[attrId])
      }
    })
  }
}

module.exports = ZigBeeDevice

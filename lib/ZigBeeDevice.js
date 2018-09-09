const zigbee = require('./zigbee')
const parseAttrId = require('./utils/parseAttrId')
const runEnrollLoop = require('../lib/utils/enroll')

class ZigBeeDevice {
  constructor({ ieeeAddr, log }) {
    const device = zigbee.device(ieeeAddr)
    this.modelId = device.modelId
    this.ieeeAddr = device.ieeeAddr
    this.endpoints = zigbee.endpoints(ieeeAddr)
    this.coordinatorAddr = zigbee.coordinator().ieeeAddr
    this.subscriptions = {}
    this.log = log
  }

  endpoint(id) {
    return this.endpoints.find(item => item.epId === id)
  }

  update(data) {
    return this.endpoints[0].getDevice().update(data)
  }

  addSubscription(key, callback) {
    if (this.subscriptions[key]) {
      this.subscriptions[key].push(callback)
    } else {
      this.subscriptions[key] = [callback]
    }
  }

  getSubscriptions(key) {
    return this.subscriptions[key] || []
  }

  subscribe(endpointId, clusterId, attrId, minInt, maxInt, repChange, callback) {
    if (repChange) {
      this.endpoint(endpointId).report(clusterId, attrId, minInt, maxInt, repChange, () => {})
    } else {
      this.endpoint(endpointId).report(clusterId, attrId, minInt, maxInt, () => {})
    }
    this.addSubscription(`report_${endpointId}_${clusterId}_${parseAttrId(attrId)}`, callback)
  }

  unstableStatusSubscribe(endpointId, clusterId, attrId, callback) {
    this.addSubscription(`status_${endpointId}_${clusterId}_${parseAttrId(attrId)}`, callback)
  }

  publish(endpointId, clusterId, attrId, data, callback) {
    return this.endpoint(endpointId).functional(clusterId, parseAttrId(attrId), data, callback)
  }

  read(endpointId, clusterId, attrId, callback) {
    return this.endpoint(endpointId).read(clusterId, parseAttrId(attrId), callback)
  }

  async unstableAISZoneEnroll(endpointId, zoneId) {
    await runEnrollLoop(this.endpoint(endpointId), this.coordinatorAddr, zoneId)
    this.log('enroll success')
  }

  handleIndicationMessage(message) { // eslint-disable-line consistent-return
    switch (message.type) {
      case 'attReport':
        return this.handleReport(message)
      case 'statusChange':
        return this.handleStatus(message)
      default:
        // Do nothing
    }
  }

  handleReport(message) {
    const endpointId = message.endpoints[0].epId
    const clusterId = message.data.cid
    const attrIds = Object.keys(message.data.data)

    attrIds.forEach((attrId) => {
      const callbacks = this.getSubscriptions(`report_${endpointId}_${clusterId}_${attrId}`)

      for (const callback of callbacks) {
        callback(message.data.data[attrId])
      }
    })
  }

  handleStatus(message) {
    const endpointId = message.endpoints[0].epId
    const clusterId = message.data.cid
    const attrIds = Object.keys(message.data)

    attrIds.forEach((attrId) => {
      const callbacks = this.getSubscriptions(`status_${endpointId}_${clusterId}_${attrId}`)

      for (const callback of callbacks) {
        callback(message.data[attrId])
      }
    })
  }
}

module.exports = ZigBeeDevice

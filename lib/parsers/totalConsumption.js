const timestamp = require('../utils/timestamp')

const CONSUMPTION_UPDATE_TIMEOUT = 5 * 60 * 1000

function calculateTotalConsumption(data, device, characteristic) {
  const nowConsumptionValue = data
  const nowConsumptionTimestamp = timestamp()

  const time = nowConsumptionTimestamp - device.prevConsumptionTimestamp
  const delta = device.prevConsumptionValue * time
  const deltaConsumption = delta / 3600 / 1000 // kWh
  const totalConsumption = characteristic.value + deltaConsumption

  device.prevConsumptionValue = nowConsumptionValue
  device.prevConsumptionTimestamp = nowConsumptionTimestamp

  return totalConsumption
}

function updateTotalConsumtion(data, device, characteristic) {
  characteristic.setValue(calculateTotalConsumption(data, device, characteristic))
}

function setTotalConsumtionUpdateTimeout(data, device, characteristic) {
  device.clearTimeout(characteristic.totalConsumptionUpdateTimeout)
  characteristic.totalConsumptionUpdateTimeout = device.setTimeout(() => {
    updateTotalConsumtion(data, device, characteristic)
    setTotalConsumtionUpdateTimeout(data, device, characteristic)
  }, CONSUMPTION_UPDATE_TIMEOUT)
}

function totalConsumptionParser(data, device, characteristic) {
  // Initial run
  if (!device.prevConsumptionTimestamp) {
    device.prevConsumptionValue = 0
    device.prevConsumptionTimestamp = timestamp()
    characteristic.totalConsumptionUpdateTimeoutName = null
  }
  // Set update timeout
  setTotalConsumtionUpdateTimeout(data, device, characteristic)
  // Return new value
  return calculateTotalConsumption(data, device, characteristic)
}

module.exports = {
  report: 'presentValue',
  reportParser: totalConsumptionParser,
  get: 'presentValue',
  getParser: totalConsumptionParser,
}

const XIAOMI_STRUCT_ATTR = { id: 65281, type: 'charStr' }
const XIAOMI_STRUCT_OLD_ATTR = { id: 65282, type: 'charStr' }
const XIAOMI_MULTICLICK_ATTR = { id: 32768, type: 'boolean' }
const XIAOMI_PRESSURE_ATTR = { id: 16, type: 'int16' }
const XIAOMI_AQARA_LOCK_OPEN_ATTR = { id: 65296, type: 'int16' }
const XIAOMI_AQARA_LOCK_WRONG_PASS_ATTR = { id: 65297, type: 'int16' }

function parseXiaomiStruct(rawData) {
  const buffer = Buffer.from(rawData, 'ascii')
  const data = {}
  let index = 0
  while (index < buffer.length) {
    const type = buffer.readUInt8(index + 1)
    const byteLength = (type & 0x7) + 1 // eslint-disable-line no-bitwise
    const isSigned = Boolean((type >> 3) & 1) // eslint-disable-line no-bitwise
    const chunk = buffer[isSigned ? 'readIntLE' : 'readUIntLE'](index + 2, byteLength)
    data[buffer.readUInt8(index)] = chunk
    index += byteLength + 2
  }
  return data
}

function parseXiaomiBatteryInfo(rawData) {
  const data = parseXiaomiStruct(rawData)
  const batteryData = data[1]
  return {
    voltage: batteryData / 1000, // voltage (v)
    battery: (batteryData - 2700) / 5, // percent (%)
  }
}

function updateXiaomiButteryCharacteristics(device, data) {
  const value = parseXiaomiBatteryInfo(data)
  device.log('battery info received:', value)
  const chargingStateCharacteristic = device.getServiceCharacteristic(
    'Battery', device.Characteristic.ChargingState
  )
  const statusLowBatteryCharacteristic = device.getServiceCharacteristic(
    'Battery', device.Characteristic.StatusLowBattery
  )
  const batteryLevelCharacteristic = device.getServiceCharacteristic(
    'Battery', device.Characteristic.BatteryLevel
  )
  const lowBatteryStatus = value.battery < 20
    ? device.Characteristic.StatusLowBattery.BATTERY_LEVEL_LOW
    : device.Characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL
  chargingStateCharacteristic.updateValue(device.Characteristic.ChargingState.NOT_CHARGEABLE)
  statusLowBatteryCharacteristic.updateValue(lowBatteryStatus)
  batteryLevelCharacteristic.updateValue(value.battery)
}

function mountXiaomiButteryCharacteristics(device, options) {
  const endpoint = 1
  const cluster = 'genBasic'
  device.zigbee.subscribe(
    endpoint,
    cluster,
    options.attrId || XIAOMI_STRUCT_ATTR,
    options.reportMinInt,
    options.reportMaxInt,
    null,
    data => updateXiaomiButteryCharacteristics(device, data)
  )
}

module.exports = {
  XIAOMI_STRUCT_ATTR,
  XIAOMI_STRUCT_OLD_ATTR,
  XIAOMI_MULTICLICK_ATTR,
  XIAOMI_PRESSURE_ATTR,
  XIAOMI_AQARA_LOCK_OPEN_ATTR,
  XIAOMI_AQARA_LOCK_WRONG_PASS_ATTR,
  parseXiaomiStruct,
  parseXiaomiBatteryInfo,
  updateXiaomiButteryCharacteristics,
  mountXiaomiButteryCharacteristics,
}

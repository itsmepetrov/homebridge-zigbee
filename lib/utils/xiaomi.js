const XIAOMI_STRUCT_ATTR = { id: 65281, type: 'charStr' }
const XIAOMI_MULTICLICK_ATTR = { id: 32768, type: 'boolean' }
const XIAOMI_PRESSURE_ATTR = { id: 16, type: 'int16' }

function parseXiaomiStruct(rawData) {
  const buffer = new Buffer(rawData, 'ascii')
  const data = {}
  let index = 0
  while (index < buffer.length) {
    const type = buffer.readUInt8(index + 1)
    const byteLength = (type & 0x7) + 1
    const isSigned = Boolean((type >> 3) & 1)
    data[buffer.readUInt8(index)] = buffer[isSigned ? 'readIntLE' : 'readUIntLE'](index + 2, byteLength)
    index += byteLength + 2
  }
  return data
}

function parseXiaomiBatteryInfo(rawData) {
  const data = parseXiaomiStruct(rawData)
  const batteryData = data[1]
  return {
    voltage: batteryData / 1000, // voltage (v)
    battery: (batteryData - 2700) / 5 // percent (%)
  }
}

module.exports = {
  XIAOMI_STRUCT_ATTR,
  XIAOMI_MULTICLICK_ATTR,
  XIAOMI_PRESSURE_ATTR,
  parseXiaomiStruct,
  parseXiaomiBatteryInfo,
}

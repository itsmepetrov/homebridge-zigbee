module.exports = {
  report: 'currentSaturation',
  reportParser: (value) => {
    console.log('sat', 'reportParser', value)
    const x = value / 254
    console.log('sat x', 'reportParser', x)
    return Math.round(x)
  },
  get: 'currentSaturation',
  getParser: (value) => {
    console.log('sat', 'getParser', value)
    const x = value / 254
    console.log('sat x', 'getParser', x)
    return Math.round(x)
  },
  set: () => 'moveToSaturation',
  setParser: (value) => {
    console.log('sat', 'setParser', value)
    return ({
      saturation: value,
      transtime: 5,
    })
  },
}

module.exports = {
  report: 'currentSaturation',
  reportParser: (value) => {
    console.log('sat', 'reportParser', value)
    return Math.round(value)
  },
  get: 'currentSaturation',
  getParser: (value) => {
    console.log('sat', 'getParser', value)
    return Math.round(value)
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

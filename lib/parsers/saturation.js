module.exports = {
  report: 'currentSaturation',
  reportParser: (value) => {
    return Math.round(value)
  },
  get: 'currentSaturation',
  getParser: (value) => {
    return Math.round(value)
  },
  set: () => 'moveToSaturation',
  setParser: (value) => {
    const sat = (value / 100) * 254
    console.log('sat', 'setParser', value, sat)
    return ({
      saturation: sat,
      transtime: 5,
    })
  },
}

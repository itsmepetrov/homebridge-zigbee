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
    const sat = Math.round(value / 254)
    console.log('sat rel', 'setParser', sat)
    return ({
      saturation: sat,
      transtime: 5,
    })
  },
}

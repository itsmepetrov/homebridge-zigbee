module.exports = {
  report: 'currentSaturation',
  reportParser: (value) => {
    console.log('hue', 'reportParser', value)
    return Math.round(value)
  },
  get: 'currentSaturation',
  getParser: (value) => {
    console.log('hue', 'getParser', value)
    return Math.round(value)
  },
  set: () => 'moveToSaturation',
  setParser: (value) => {
    console.log('hue', 'setParser', value)
    return ({
      saturation: value,
      transtime: 5,
    })
  },
}

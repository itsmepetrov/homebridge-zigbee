module.exports = {
  report: 'currentSaturation',
  reportParser: (value, ...rest) => {
    console.log('hue', 'reportParser', value, rest)
    return Math.round(value)
  },
  get: 'currentSaturation',
  getParser: (value, ...rest) => {
    console.log('hue', 'getParser', value, rest)
    return Math.round(value)
  },
  set: () => 'moveToSaturation',
  setParser: (value, ...rest) => {
    console.log('hue', 'setParser', value, rest)
    return ({
      saturation: value,
      transtime: 5,
    })
  },
}

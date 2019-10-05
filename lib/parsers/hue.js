module.exports = {
  report: 'currentHue',
  reportParser: (value, ...rest) => {
    console.log('hue', 'reportParser', value, rest)
    return Math.round(value)
  },
  get: 'currentHue',
  getParser: (value, ...rest) => {
    console.log('hue', 'getParser', value, rest)
    return Math.round(value)
  },
  set: () => 'moveToHue',
  setParser: (value, ...rest) => {
    console.log('hue', 'setParser', value, rest)
    return ({
      hue: value,
      direction: 1,
      transtime: 5,
    })
  },
}

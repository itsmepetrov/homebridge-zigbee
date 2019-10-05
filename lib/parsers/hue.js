module.exports = {
  report: 'currentHue',
  reportParser: (value) => {
    console.log('hue', 'reportParser', value)
    return Math.round(value)
  },
  get: 'currentHue',
  getParser: (value) => {
    console.log('hue', 'getParser', value)
    return Math.round(value)
  },
  set: () => 'moveToHue',
  setParser: (value) => {
    console.log('hue', 'setParser', value)
    return ({
      hue: value,
      direction: 1,
      transtime: 5,
    })
  },
}

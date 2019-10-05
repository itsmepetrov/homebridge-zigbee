module.exports = {
  report: 'currentHue',
  reportParser: (value) => {
    console.log('hue', 'reportParser', value)
    return Math.round(value * (360 / 254))
  },
  get: 'currentHue',
  getParser: (value) => {
    console.log('hue', 'getParser', value)
    return Math.round(value * (360 / 254))
  },
  set: () => 'moveToHue',
  setParser: (value) => {
    console.log('hue', 'setParser', value)
    const calcHue = Math.round(value / (360 / 254))
    console.log('hue rel', 'setParser', calcHue)
    return ({
      hue: calcHue,
      direction: 1,
      transtime: 5,
    })
  },
}

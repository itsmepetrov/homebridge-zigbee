module.exports = {
  report: 'currentHue',
  reportParser: (value) => {
    console.log('hue', 'reportParser', value)
    return value
  },
  get: 'currentHue',
  getParser: (value) => {
    console.log('hue', 'getParser', value)
    return value
  },
  set: () => 'moveToHue',
  setParser: (value) => {
    const h = value / (360 / 254)
    console.log('hue', 'setParser', value, h)
    return ({
      hue: h,
      direction: 1,
      transtime: 5,
    })
  },
}

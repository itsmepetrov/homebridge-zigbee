module.exports = {
  report: 'currentHue',
  reportParser: (value) => {
    console.log('hue', 'reportParser', value)
    const x = value * (360 / 254)
    console.log('hue x', 'reportParser', x)
    return x
  },
  get: 'currentHue',
  getParser: (value) => {
    console.log('hue', 'getParser', value)
    const x = value * (360 / 254)
    console.log('hue x', 'getParser', x)
    return x
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

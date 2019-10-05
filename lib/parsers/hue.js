module.exports = {
  report: 'currentHue',
  reportParser: value => Math.round(value),
  get: 'currentHue',
  getParser: value => Math.round(value),
  set: () => 'moveToHue',
  setParser: (value) => {
    console.log('hue', value)
    return ({
      hue: Math.round(value),
      direction: 0,
      transtime: 5,
    })
  },
}

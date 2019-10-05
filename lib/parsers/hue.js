module.exports = {
  report: 'currentHue',
  reportParser: value => Math.round(value),
  get: 'currentHue',
  getParser: value => Math.round(value),
  set: () => 'moveToHue',
  setParser: (value) => {
    console.log('hue', value)
    const calcHue = Math.round(value * 360 / 254)
    console.log('calcHue', calcHue)
    return ({
      hue: calcHue,
      direction: 0,
      transtime: 5,
    })
  },
}

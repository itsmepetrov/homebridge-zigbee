module.exports = {
  report: 'currentHue',
  reportParser: value => value,
  get: 'currentHue',
  getParser: value => value,
  set: () => 'moveToHue',
  setParser: (value) => {
    const h = value / (360 / 254)
    return ({
      hue: h,
      direction: 1,
      transtime: 5,
    })
  },
}

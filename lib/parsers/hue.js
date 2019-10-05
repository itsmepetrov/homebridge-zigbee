module.exports = {
  report: 'currentHue',
  reportParser: value => Math.round(value),
  get: 'currentHue',
  getParser: value => Math.round(value),
  set: () => 'moveToHue',
  setParser: value => ({
    hue: value,
    direction: 1,
    transtime: 5,
  }),
}

module.exports = {
  report: 'currentSaturation',
  reportParser: value => Math.round(value),
  get: 'currentSaturation',
  getParser: value => Math.round(value),
  set: () => 'moveToSaturation',
  setParser: value => ({
    saturation: value,
    transtime: 5,
  }),
}

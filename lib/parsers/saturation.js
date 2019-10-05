module.exports = {
  report: 'currentSaturation',
  reportParser: value => Math.round(value),
  get: 'currentSaturation',
  getParser: value => Math.round(value),
  set: () => 'moveToSaturation',
  setParser: (value) => {
    console.log('sat', value)
    return ({
      saturation: Math.round(value),
      transtime: 5,
    })
  },
}

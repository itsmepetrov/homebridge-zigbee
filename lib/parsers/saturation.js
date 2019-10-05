module.exports = {
  report: 'currentSaturation',
  reportParser: value => Math.round(value),
  get: 'currentSaturation',
  getParser: value => Math.round(value),
  set: () => 'moveToSaturation',
  setParser: (value) => {
    console.log('sat', value)
    const calcSat = value / 254
    console.log('calcSat', calcSat)
    return ({
      saturation: calcSat,
      transtime: 5,
    })
  },
}

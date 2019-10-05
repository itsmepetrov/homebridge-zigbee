module.exports = {
  report: 'currentSaturation',
  reportParser: value => value,
  get: 'currentSaturation',
  getParser: value => value,
  set: () => 'moveToSaturation',
  setParser: (value) => {
    const sat = (value / 100) * 254
    return ({
      saturation: sat,
      transtime: 5,
    })
  },
}

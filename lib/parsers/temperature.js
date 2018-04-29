module.exports = {
  report: 'measuredValue',
  reportParser: (data) => Math.round((data / 100) * 10) / 10,
  get: 'measuredValue',
  getParser: (data) => Math.round((data / 100) * 10) / 10,
}
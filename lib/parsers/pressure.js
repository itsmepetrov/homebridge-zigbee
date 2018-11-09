module.exports = {
  report: 'measuredValue',
  reportParser: data => Math.round(data),
  get: 'measuredValue',
  getParser: data => Math.round(data),
}

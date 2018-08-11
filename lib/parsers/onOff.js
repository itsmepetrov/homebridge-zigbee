module.exports = {
  report: 'onOff',
  reportParser: data => data === 1,
  get: 'onOff',
  getParser: data => data === 1,
  set: value => value ? 'on' : 'off',
  setParser: () => ({}),
}

module.exports = {
  report: 'color',
  reportParser: data => data,
  get: 'color',
  getParser: data => data,
  set: () => 'moveToColor',
  setParser: (...value) => ({
    colorx: value[0],
    colory: value[1],
    tanstime: 5,
  }),
}

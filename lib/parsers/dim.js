const MAX_DIM = 254

module.exports = {
  report: 'currentLevel',
  reportParser: (value) => value / MAX_DIM * 100,
  get: 'currentLevel',
  getParser: (value) => value / MAX_DIM * 100,
  set: () => 'moveToLevel',
  setParser: (value) => ({
    level: Math.round(value * MAX_DIM / 100),
    transtime: 5,
  }),
}
module.exports = function parseModel(model) {
  // Remove non-ascii symbols
  return model
    .replace(/[^ -~]+/g, '')
    .replace(/[^\x00-\x7F]/g, '') // eslint-disable-line no-control-regex
    .trim()
}

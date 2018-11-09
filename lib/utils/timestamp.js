module.exports = function timestamp(date) {
  return Math.round((date ? Date.parse(date) : Date.now()) / 1000)
}

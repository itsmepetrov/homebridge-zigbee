const util = require('util')

module.exports = function promisify(original, ...args) {
  return util.promisify(original)(...args)
}

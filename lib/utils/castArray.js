module.exports = function castArray(item) {
  return Array.isArray(item) ? item : [item]
}
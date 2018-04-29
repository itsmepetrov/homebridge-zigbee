module.exports = function parseAttrId(attrId) {
  if (typeof attrId === 'object') {
    return attrId.id
  } else {
    return attrId
  }
}

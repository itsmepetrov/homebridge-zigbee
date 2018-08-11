module.exports = function parseModel(model) {
    return model.replace(/[^ -~]+/g, '').trim() // Remove non-ascii symbols
}
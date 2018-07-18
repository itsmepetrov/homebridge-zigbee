module.exports = function parseModel(model) {
    return model.replace(/[^ -~]+/g, ''); // Remove non-ascii symbols
}
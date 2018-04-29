/**
 * Map a range of values to a different range of values.
 * @param inputStart
 * @param inputEnd
 * @param outputStart
 * @param outputEnd
 * @param input
 * @returns {number}
 * @memberof Util
 */
module.exports = function mapValueRange(inputStart, inputEnd, outputStart, outputEnd, input) {
	if (typeof inputStart !== 'number' || typeof inputEnd !== 'number' ||
		typeof outputStart !== 'number' || typeof outputEnd !== 'number' ||
		typeof input !== 'number') {
		return null;
	}
	return outputStart + ((outputEnd - outputStart) / (inputEnd - inputStart)) * (input - inputStart);
}

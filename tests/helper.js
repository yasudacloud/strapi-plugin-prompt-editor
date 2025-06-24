/**
 * sleep
 * @param ms
 * @returns {Promise<unknown>}
 */
module.exports.sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

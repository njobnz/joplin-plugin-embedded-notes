/**
 * Escapes special regex characters in a string.
 *
 * @param {string} str - String to escape.
 * @returns {string} The escaped string.
 */
export default (str: string): string => str.replace(/[-[\]{}()*+!<=:?.\/\\^$|#\s,]/g, '\\$&');

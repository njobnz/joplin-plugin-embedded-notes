/**
 * Escapes special regex characters in a string.
 *
 * @param {string} str - String to escape.
 * @returns {string} The escaped string.
 */
export const escapeRegEx = (str: string): string =>
  str.replace(/[-[\]{}()*+!<=:?.\/\\^$|#\s,]/g, '\\$&');

/**
 * Validates a 32-character hexadecimal Joplin ID.
 *
 * @param {string} str String to validate.
 * @returns {boolean} Validation result.
 */
export const validateJoplinId = (str: string): boolean => /^[0-9A-Fa-f]{32}$/g.test(str);

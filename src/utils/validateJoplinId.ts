/**
 * Validates a 32-character hexadecimal Joplin ID.
 *
 * @param {string} str String to validate.
 * @returns {boolean} Validation result.
 */
export default (str: string): boolean => /^[0-9A-Fa-f]{32}$/g.test(str);

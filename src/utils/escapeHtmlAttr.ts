/**
 * Escapes special HTML characters in a string for safe use in an attribute value.
 *
 * @param {string} input - The string to escape
 * @returns {string} The escaped input string
 */
export default (input: string): string =>
  input
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

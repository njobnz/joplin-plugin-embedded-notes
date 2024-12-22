/**
 * Replaces escaped characters in a string with their actual characters.
 *
 * @param {string} input - The string containing escaped characters
 * @returns {string} The unescaped string
 */
export default (input: string): string => {
  return input
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\b/g, '\b')
    .replace(/\\f/g, '\f')
    .replace(/\\v/g, '\v')
    .replace(/\\'/g, "'")
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\');
};

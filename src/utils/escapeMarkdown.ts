/**
 * Escapes special Markdown characters in a string.
 *
 * @param {string} input - The Markdown string to escape
 * @returns {string} The escaped input string
 */
export default (input: string): string => input.replace(/([\\`*{}[\]()#+\-.!_|>])/g, '\\$1');

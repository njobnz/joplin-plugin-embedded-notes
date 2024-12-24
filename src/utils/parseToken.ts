import { TokenInfo } from '../types';

/**
 * Parses a token and extracts its properties.
 *
 * @param {string} input - The input token.
 * @param {string} prefix - The token opening tag.
 * @param {string} suffix - The token closing tag.
 * @throws {Error} If the prefix or suffix is missing or invalid.
 * @returns {Object} An object containing the token info.
 */
export default (input: string, prefix: string, suffix: string): TokenInfo => {
  if (!prefix || !suffix) throw new Error('Token prefix or suffix cannot be empty.');
  return { name: input, input, token: `${prefix}${input}${suffix}` };
};

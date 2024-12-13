import { escapeRegEx as escape } from '../utilities';

/**
 * Extracts unique tokens from a text string using specified prefix and suffix.
 *
 * @param {string} text - The text to parse.
 * @param {string} prefix - The token opening tag.
 * @param {string} suffix - The token closing tag.
 * @throws {Error} If the prefix or suffix is missing or invalid.
 * @returns {Promise<string[]>} An array of unique token names.
 */
// prettier-ignore
export const parseTokens = async (text: string, prefix: string, suffix: string): Promise<string[]> => {
  if (!prefix || !suffix)
    throw new Error('Token prefix or suffix cannot be empty.');

  // prettier-ignore
  const p = escape(prefix), s = escape(suffix), m = p + s;
  const pattern = new RegExp(`${p}([^${m}\\s][^${m}\n\r]+[^${m}\\s]|[^${m}\\s]{1})${s}`, 'g');
  return [...text.matchAll(pattern)].map(match => match[1]);
};

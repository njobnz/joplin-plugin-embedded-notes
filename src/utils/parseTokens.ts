/**
 * Extracts unique tokens from a text string between a specified prefix and suffix.
 *
 * @param {string} text - The text to parse.
 * @param {string} prefix - The token opening tag.
 * @param {string} suffix - The token closing tag.
 * @throws {Error} If the prefix or suffix is missing or invalid.
 * @returns {string[]} An array of unique token names.
 */
export const parseTokens = (text: string, prefix: string, suffix: string): string[] => {
  if (!(prefix = prefix.trim()) || !(suffix = suffix.trim()))
    throw new Error('Token prefix or suffix cannot be empty.');

  const tokens = new Set<string>();
  let currentIdx = 0;

  while (currentIdx < text.length) {
    // Locate the next prefix
    const prefixIdx = text.indexOf(prefix, currentIdx);
    if (prefixIdx === -1) break;

    // Skip outermode prefixes (eg. {{{{token2}})
    const nextIdx = prefixIdx + 1;
    if (prefix === text.slice(nextIdx, nextIdx + prefix.length)) {
      currentIdx = nextIdx;
      continue;
    }

    // Locate the next suffix
    const tokenIdx = prefixIdx + prefix.length;
    const suffixIdx = text.indexOf(suffix, tokenIdx);
    if (suffixIdx === -1) break;

    // Extract the token
    let token = text.slice(tokenIdx, suffixIdx);

    // Jump to the innermost nested prefix (eg. tok{{en1{{token2}} = token2)
    const innerPrefixIdx = token.lastIndexOf(prefix);
    if (innerPrefixIdx !== -1 && prefix !== suffix)
      // Extract nested token
      token = token.slice(innerPrefixIdx + prefix.length);

    // Validate token and add to set
    if (!/^\s|\s$|[\n\r]/.test(token) && token) tokens.add(token);

    // Return all adjacent tokens if prefix and suffix are the same.
    // Handles ambiguous token matches. (eg. %%token1%%token2%% = [token1, token2])
    currentIdx = prefix === suffix ? suffixIdx : suffixIdx + suffix.length;
  }

  return Array.from(tokens);
};

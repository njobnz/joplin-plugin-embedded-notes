import { EmbeddableNote } from '../types';
import escape from '../utils/escapeRegExp';

export default (text: string, embeddings: Map<string, EmbeddableNote>): string => replaceTokens(text, embeddings);

/**
 * Replaces all tokens in a text string with their corresponding note text.
 *
 * This method doesn't take into account renderer tags, so all tokens are
 * replaced with the raw content from their referenced notes.
 *
 * @param {string} text - The input text.
 * @param {Map<string, EmbeddableNote>} embeddings - A mapping of note titles and ids to their note object.
 * @returns {string} The replaced text.
 */
const replaceTokens = (text: string, embeddings: Map<string, EmbeddableNote>): string => {
  if (text) {
    // Replaces tokens in the order they appear in the string.
    // For ambiguous tokens, only the first one is replaced.
    const filter = Array.from(embeddings.keys()).filter(token => text.includes(token));
    const sorted = filter.sort((a, b) => text.indexOf(a) - text.indexOf(b));
    sorted.forEach(item => {
      const embed = embeddings.get(item) ?? null;
      if (!embed) return;
      text = text.replace(new RegExp(escape(item), 'g'), embed.note?.body || '');
    });
  }
  return text;
};

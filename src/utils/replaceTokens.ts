import { EmbeddableNote } from '../types';
import escapeRegExp from './escapeRegExp';

/**
 * Replaces tokens in a text string with the corresponding note content.
 *
 * @param {string} id - Id of the current note.
 * @param {string} input - The text containing tokens to be replaced.
 * @param {Record<string, EmbeddableNote>} embeddings - A map of tokens (titles or IDs) to note objects containing the text to replace the tokens.
 * @param {Set<string>} [visited] - A set to track visited notes and prevent loops during recursion.
 * @returns {string} The input text with tokens replaced by note content.
 */
export default function replaceTokens(
  id: string,
  input: string,
  embeddings: Record<string, EmbeddableNote>,
  visited: Set<string> = new Set<string>()
): string {
  if (!input || !embeddings) return input;
  if (!visited) visited = new Set<string>();

  return Object.keys(embeddings)
    .filter(token => input.includes(token))
    .sort((a, b) => input.indexOf(a) - input.indexOf(b))
    .reduce((text, token) => {
      const embed = embeddings[token];

      // Check if the note has already been processed to avoid infinite loops
      if (visited.has(embed?.note?.id) || id === embed?.note?.id || !embed?.note?.body) return text;

      const content = embed.note.body;
      const pattern = new RegExp(escapeRegExp(token), 'g');

      visited.add(embed.note.id);
      const replace = replaceTokens(id, text.replace(pattern, content), embeddings, visited);
      visited.delete(embed.note.id);

      return replace;
    }, input);
}

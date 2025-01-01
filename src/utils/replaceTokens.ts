import { EmbeddableNote } from '../types';
import escapeRegExp from './escapeRegExp';

/**
 * Replaces all tokens in a text string with their corresponding note text.
 *
 * @param {string} input - The input text.
 * @param {Record<string, EmbeddableNote>} embeddings - A mapping of note titles and ids to their note object.
 * @returns {string} The replaced text.
 */
export default (input: string, embeddings: Record<string, EmbeddableNote>, resourceBaseUrl?: string): string => {
  if (!input || !embeddings) return input;

  return Object.keys(embeddings)
    .filter(token => input.includes(token))
    .sort((a, b) => input.indexOf(a) - input.indexOf(b))
    .reduce((text, token) => {
      const embed = embeddings[token];
      if (!embed?.note?.body) return text;
      const body = resourceBaseUrl ? replaceResourceUrls(embed.note.body, resourceBaseUrl) : embed.note.body;
      const pattern = new RegExp(escapeRegExp(token), 'g');
      return text.replace(pattern, body);
    }, input);
};

const replaceResourceUrls = (content: string, resourceBaseUrl: string): string => {
  const pattern = new RegExp(`]\\((:/([0-9A-Fa-f]{32}))\\)`, 'g');
  return content.replace(pattern, (match, p1, p2) => match.replace(p1, `${resourceBaseUrl}/${p2}`));
};

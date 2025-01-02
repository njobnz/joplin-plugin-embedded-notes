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
      // Replace resource URLs if a resource base URL is provided.
      const body = resourceBaseUrl ? replaceResourceUrls(embed.note.body, resourceBaseUrl) : embed.note.body;
      const pattern = new RegExp(escapeRegExp(token), 'g');
      return text.replace(pattern, body);
    }, input);
};

/**
 * Prepend the resource base URL to resource URLs in the content.
 *
 * Embedded resources from referenced notes are not loaded when the
 * markdown renderer is called. The resource base URL is prepended
 * to resource URLs, but file extensions and mime type are not available
 * and need to be fetched from the API. Since the Joplin API cannot be
 * queried inside markdownIt rules, `updateResources` method is called
 * after the markdown is rendered to fetch additional resource data.
 * The resource elements are then built manually. This workaround is
 * not ideal, there maybe a better way to load extra resources but
 * it's not clear how.
 *
 * @param {string} content - The content.
 * @param {string} resourceBaseUrl - The base URL for resources.
 * @returns {string} The replaced text.
 */
const replaceResourceUrls = (content: string, resourceBaseUrl: string): string => {
  const pattern = new RegExp(`]\\((:/([0-9A-Fa-f]{32}(|#[^\\s]*)(|\\s".*?")))\\)`, 'g');
  return content.replace(pattern, (match, p1, p2) => match.replace(p1, `${resourceBaseUrl}/${p2}`));
};

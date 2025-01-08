import { EmbeddableNote } from '../types';
import escapeRegExp from './escapeRegExp';

/**
 * Replaces tokens in a text string with the corresponding note content.
 *
 * @param {string} id - Id of the current note.
 * @param {string} input - The text containing tokens to be replaced.
 * @param {Record<string, EmbeddableNote>} embeddings - A map of tokens (titles or IDs) to note objects containing the text to replace the tokens.
 * @param {string} [resourceBaseUrl] - An optional URL to replace resource links in the note content.
 * @param {Set<string>} [visited] - A set to track visited notes and prevent loops during recursion.
 * @returns {string} The input text with tokens replaced by note content.
 */
export default function replaceTokens(
  id: string,
  input: string,
  embeddings: Record<string, EmbeddableNote>,
  resourceBaseUrl?: string,
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

      // Replace resource URLs if a resource base URL is provided.
      const content = resourceBaseUrl ? replaceResourceUrls(embed.note.body, resourceBaseUrl) : embed.note.body;
      const pattern = new RegExp(escapeRegExp(token), 'g');

      visited.add(embed.note.id);
      const replace = replaceTokens(id, text.replace(pattern, content), embeddings, resourceBaseUrl, visited);
      visited.delete(embed.note.id);

      return replace;
    }, input);
}

/**
 * Prepend the resource base URL to resource URLs in the content.
 *
 * Embedded resources from referenced notes are not loaded when the
 * markdown renderer is called. Here the resource base URL is prepended
 * to resource URLs, but file extension and mime type are not available
 * and need to be fetched from the API. Since the Joplin API cannot be
 * queried inside markdownIt rules, `updateResources` method is called
 * after the markdown is rendered to fetch additional resource data.
 * The resource elements are then built manually. This workaround is
 * not ideal, there maybe a better way to load extra resources but
 * it's not clear how.
 *
 * @param {string} content - The content.
 * @param {string} resourceBaseUrl - The base URL for resources.
 * @returns {string} The replaced content.
 */
const replaceResourceUrls = (content: string, resourceBaseUrl: string): string => {
  const pattern = new RegExp(`]\\((:/([0-9A-Fa-f]{32}(|#[^\\s]*)(|\\s".*?")))\\)`, 'g');
  return content.replace(pattern, (match, p1, p2) => match.replace(p1, `${resourceBaseUrl}/${p2}`));
};

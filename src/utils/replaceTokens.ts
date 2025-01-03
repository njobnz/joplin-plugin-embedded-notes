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
 * @param {string} baseUrl - The base URL for resources.
 * @returns {string} The replaced content.
 */
const replaceResourceUrls = (content: string, baseUrl: string): string => {
  const pattern = new RegExp(`]\\((:/([0-9A-Fa-f]{32}(|#[^\\s]*)(|\\s".*?")))\\)`, 'g');
  const result = [];
  const lines = content.split(/(\r?\n)/);

  let inBlock = false;
  let opening = '';

  // Search for fenced code blocks and ignore resource URLs inside them
  // TODO: don't replace inside inline code blocks
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(/^(\s{0,3})(`{3,})(?!.*`)/);

    if (match) {
      if (!inBlock) {
        // Opening fence
        inBlock = true;
        opening = match[2];
      } else if (line.trim().startsWith(opening)) {
        // Closing fence matches opening
        inBlock = false;
        opening = '';
      }
    }

    // Replace if not in fenced code or unformatted text block
    if (!inBlock && !/^(\s{4}|\t)/.test(line)) {
      result.push(line.replace(pattern, (match, p1, p2) => match.replace(p1, `${baseUrl}/${p2}`)));
    } else {
      result.push(line);
    }
  }

  return result.join('');
};

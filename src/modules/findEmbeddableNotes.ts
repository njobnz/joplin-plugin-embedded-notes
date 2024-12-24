import joplin from 'api';
import setting from '../utils/getSetting';

/**
 * Fetches embeddable notes based on a search filter or tag and returns the specified fields.
 *
 * This function retrieves notes either using a search query or by fetching all notes
 * if no filter or tag is provided. Pagination is handled internally to ensure
 * all matching notes are retrieved up to the specified limit.
 *
 * @param {string} filter - Optional filter string to search note titles. Defaults to an empty string.
 * @param {number} limit - Optional maximum number of notes to retrieve. Defaults to 0 (no limit).
 * @param {string[]} fields - Optional array of note fields to include in the response. Defaults to ['id', 'parent_id', 'title'] if not specified.
 * @returns {Promise<any[]>} An array of fetched notes.
 */
export default async (filter: string = '', limit: number = 0, fields: string[] = null): Promise<any[]> => {
  const results: any[] = [];

  const fetchNotes = async (path: string[], query?: string): Promise<void> => {
    for (let page = 1; ; page++) {
      try {
        const { items, has_more } = await joplin.data.get(path, {
          page,
          fields: fields ?? ['id', 'parent_id', 'title'],
          ...(query && { query }),
        });
        results.push(...items);
        if (!has_more || (limit > 0 && results.length >= limit)) break;
      } catch (error) {
        console.error('Error fetching notes:', error);
        break;
      }
    }
  };

  const tag = await setting<string>('tag');
  const parts = [];

  if (tag) parts.push(tag);
  if (filter) parts.push(`title:"${filter}*"`);

  const query = parts.length > 0 ? parts.join(' ') : null;
  await fetchNotes(query ? ['search'] : ['notes'], query);

  return results;
};

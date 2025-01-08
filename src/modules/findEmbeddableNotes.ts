import setting from '../utils/getSetting';
import fetchNotes from '../utils/fetchNotes';

/**
 * Fetches embeddable notes based on a search filter or tag and returns the specified fields.
 *
 * This function retrieves notes either using a search query or by fetching all notes
 * if no filter or tag is provided. Pagination is handled internally to ensure
 * all matching notes are retrieved up to the specified limit.
 *
 * @param {string} filter - Optional filter string to search note titles. Defaults to an empty string.
 * @param {string[]} fields - Optional array of note fields to include in the response. Defaults to ['id', 'parent_id', 'title'] if not specified.
 * @param {number} limit - Optional maximum number of notes to retrieve. Defaults to 0 (no limit).
 * @returns {Promise<any[]>} An array of fetched notes.
 */
export default async (filter: string = '', fields?: string[], limit: number = 0): Promise<any[]> => {
  const parts = [];
  const search = await setting<string>('tag');

  if (search) parts.push(search);
  if (filter) parts.push(`title:"${filter}*"`);

  const query = parts.length > 0 ? (filter ? '/' : '') + parts.join(' ') : null;
  return await fetchNotes(query ? ['search'] : ['notes'], query, fields, limit);
};

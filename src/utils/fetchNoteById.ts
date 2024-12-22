import joplin from 'api';

/**
 * Fetches a note by its ID and retrieves the specific fields.
 *
 * @param {string} noteId - The ID of the note to fetch.
 * @param {string[]} fields - An array of field names to include in the fetched note data.
 * @returns {Promise<any>} The note data with the specified fields.
 */
export default async (noteId: string, fields: string[]): Promise<any> => {
  try {
    return await joplin.data.get(['notes', noteId], { fields });
  } catch (error) {
    console.error('Error fetching note:', error);
    return null;
  }
};

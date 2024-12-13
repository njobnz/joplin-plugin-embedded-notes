import { EmbeddableNote } from '../types';
import { findEmbeddableNotes } from './findEmbeddableNotes';
import { validateJoplinId as validId } from '../utilities';
import { getSettings as settings } from '../utils/getSettings';
import { fetchNoteById } from '../utils/fetchNoteById';
import { parseTokens } from '../utils/parseTokens';
import { parseToken } from '../utils/parseToken';

/**
 * Reads parsed tokens from a note and fetches associated notes by ID or title.
 *
 * Returns a map of tokens with their associated note data.
 *
 * @param {any} note - A note containing tokens to fetch.
 * @returns {Promise<Map<string, EmbeddableNote>>} A map of tokens to their associated note data.
 */
export const fetchEmbeddableNotes = async (
  note: any,
  fields = ['id', 'title', 'body']
): Promise<Map<string, EmbeddableNote>> => {
  const tokens: Map<string, EmbeddableNote> = new Map();

  if (!note) return tokens;

  const { prefix, suffix, idOnly } = settings();
  const result = await parseTokens(note.body, prefix, suffix);
  const notes = idOnly ? [] : await findEmbeddableNotes('', 0, fields);

  for (const key of result) {
    const info = parseToken(key);
    const { name, token } = info;
    const item =
      notes.find(i => i.id === name || i.title === name) ||
      (validId(name) ? await fetchNoteById(name, fields) : null);
    if (item) tokens.set(token, { note: item, info });
  }

  return tokens;
};

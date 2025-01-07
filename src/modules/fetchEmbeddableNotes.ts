import { EmbeddableNote } from '../types';
import findEmbeddableNotes from './findEmbeddableNotes';
import fetchNoteById from '../utils/fetchNoteById';
import validId from '../utils/validateJoplinId';
import setting from '../utils/getSetting';
import getFenceContent from '../utils/getFenceContent';
import parseTokens from '../utils/parseTokens';
import parseToken from '../utils/parseToken';
/**
 * Reads parsed tokens from a note and fetches associated notes by ID or title.
 *
 * Returns a map of tokens with their associated note data.
 *
 * @param {any} note - A note containing tokens to fetch.
 * @returns {Promise<Map<string, EmbeddableNote>>} A map of tokens to their associated note data.
 */
export default async (note: any, fields = ['id', 'title', 'body']): Promise<Map<string, EmbeddableNote>> => {
  if (!note) return new Map<string, EmbeddableNote>();

  const [prefix, suffix, idOnly, fenceOnly] = await Promise.all([
    await setting<string>('prefix'),
    await setting<string>('suffix'),
    await setting<boolean>('idOnly'),
    await setting<boolean>('fenceOnly'),
  ]);

  const tokens = new Map<string, EmbeddableNote>();
  const content = fenceOnly ? getFenceContent(note.body) : note.body;
  const result = parseTokens(content, prefix, suffix);
  const notes = idOnly || !result.length ? [] : await findEmbeddableNotes('', 0, ['id', 'title']);

  await Promise.all(
    result.map(async key => {
      const info = parseToken(key, prefix, suffix);
      const { name, token } = info;

      const item = notes.find(i => i.id === name || i.title === name);
      const noteId = item?.id || (validId(name.slice(0, 32)) ? name.slice(0, 32) : null);

      if (noteId) {
        const note = await fetchNoteById(noteId, fields);
        if (note) tokens.set(token, { note, info });
      }
    })
  );

  return tokens;
};

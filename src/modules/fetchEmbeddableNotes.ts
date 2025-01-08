import { EmbeddableNote } from '../types';
import findEmbeddableNotes from './findEmbeddableNotes';
import getEmbeddableFencedContent from './getEmbeddableFencedContent';
import setting from '../utils/getSetting';
import validId from '../utils/validateJoplinId';
import fetchNoteById from '../utils/fetchNoteById';
import parseTokens from '../utils/parseTokens';
import parseToken from '../utils/parseToken';

/**
 * Reads parsed tokens from a note and fetches associated notes by ID or title.
 *
 * Returns a map of tokens with their associated note data.
 *
 * @param {any} note - A note containing tokens to fetch.
 * @param {string[]} fields - Fields to fetch for each note.
 * @param {Map<string, EmbeddableNote>} tokens - A map to store fetched tokens and associated notes.
 * @returns {Promise<Map<string, EmbeddableNote>>} A map of tokens to their associated note data.
 */
export default async function fetchEmbeddableNotes(
  note: any,
  fields = ['id', 'title', 'body'],
  tokens: Map<string, EmbeddableNote> = new Map<string, EmbeddableNote>()
): Promise<Map<string, EmbeddableNote>> {
  if (!note) return new Map<string, EmbeddableNote>();

  const [prefix, suffix, idOnly, fenceOnly] = await Promise.all([
    setting<string>('prefix'),
    setting<string>('suffix'),
    setting<boolean>('idOnly'),
    setting<boolean>('fenceOnly'),
  ]);

  const content = fenceOnly ? getEmbeddableFencedContent(note.body) : note.body;
  const result = parseTokens(content, prefix, suffix);
  const notes = idOnly || !result.length ? [] : await findEmbeddableNotes('', ['id', 'title'], 0);

  await Promise.all(
    result.map(async key => {
      const info = parseToken(key, prefix, suffix);
      const { name, token } = info;
      if (tokens.has(token)) return;

      const item = notes.find(i => i.id === name || i.title === name);
      const noteId = item?.id || (validId(name.slice(0, 32)) ? name.slice(0, 32) : null);
      if (!noteId) return;

      const note = await fetchNoteById(noteId, [...new Set(['id', 'title', 'body', ...fields])]);
      if (!note) return;

      tokens.set(token, { note, info });
      await fetchEmbeddableNotes(note, fields, tokens);
    })
  );

  return tokens;
}

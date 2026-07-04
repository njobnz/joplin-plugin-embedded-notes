import { EmbeddableNote, JoplinNote } from '../types';
import findEmbeddableNotes from './findEmbeddableNotes';
import getEmbeddableContent from './getEmbeddableContent';
import getEmbeddableContentFenced from './getEmbeddableContentFenced';
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
 * @param {number} limit - Maximum depth of recursion to prevent infinite loops.
 * @returns {Promise<Map<string, EmbeddableNote>>} A map of tokens to their associated note data.
 */
export default async function fetchEmbeddableNotes(
  note: any,
  fields: string[] = ['id', 'title', 'body'],
  tokens: Map<string, EmbeddableNote> = new Map<string, EmbeddableNote>(),
  limit: number = 3
): Promise<Map<string, EmbeddableNote>> {
  let cache: JoplinNote[] = [];

  const [prefix, suffix, idOnly, fenceOnly] = await Promise.all([
    setting<string>('prefix'),
    setting<string>('suffix'),
    setting<boolean>('idOnly'),
    setting<boolean>('fenceOnly'),
  ]);

  async function fetchEmbeddings(
    n: any,
    t: Map<string, EmbeddableNote>,
    depth: number = 0
  ): Promise<Map<string, EmbeddableNote>> {
    if (!n || depth > limit) return t;

    const content = fenceOnly ? getEmbeddableContentFenced(n.body) : getEmbeddableContent(n.body);
    const result = parseTokens(content, prefix, suffix);

    if (cache.length === 0) {
      cache = idOnly || !result.length ? [] : await findEmbeddableNotes('', ['id', 'title'], 0);
    }

    await Promise.all(
      result.map(async key => {
        const info = parseToken(key, prefix, suffix);
        const { name, token } = info;
        if (t.has(token)) return;

        const item = cache.find(i => i.id === name || i.title === name);
        const noteId = item?.id || (validId(name.slice(0, 32)) ? name.slice(0, 32) : null);
        if (!noteId) return;

        const note = await fetchNoteById(noteId, [...new Set(['id', 'title', 'body', ...fields])]);
        if (!note) return;

        t.set(token, { note, info, depth });
        await fetchEmbeddings(note, t, depth + 1);
      })
    );

    return t;
  }

  return fetchEmbeddings(note, tokens);
}

import { EmbeddableNote, JoplinNote } from '../types';
import { EMBEDDED_BLOCK_HEADER } from '../constants';
import replaceTokens from '../utils/replaceTokens';
import parseContent from '../utils/parseContent';

export default (note: JoplinNote, embeddings: Map<string, EmbeddableNote>, fenceOnly: boolean = false): string => {
  const entries = Object.fromEntries(embeddings);
  if (!fenceOnly) return replaceTokens(note.id, note.body, entries);
  return parseContent(note.body)
    .map(item => (item.type === EMBEDDED_BLOCK_HEADER ? replaceTokens(note.id, item.text, entries) : item.text))
    .join('');
};

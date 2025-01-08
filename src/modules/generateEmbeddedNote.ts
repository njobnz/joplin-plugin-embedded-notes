import { EmbeddableNote, JoplinNote } from '../types';
import { EMBEDDED_BLOCK_HEADER } from '../constants';
import replaceTokens from '../utils/replaceTokens';
import parseEmbeddableFencedBlocks from './parseEmbeddableFencedBlocks';

export default (note: JoplinNote, embeddings: Map<string, EmbeddableNote>, fenceOnly: boolean = false): string => {
  const entries = Object.fromEntries(embeddings);
  if (!fenceOnly) return replaceTokens(note.id, note.body, entries);
  return parseEmbeddableFencedBlocks(note.body)
    .map(item => (item.type === EMBEDDED_BLOCK_HEADER ? replaceTokens(note.id, item.content, entries) : item.content))
    .join('');
};

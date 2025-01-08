import { EmbeddableNote } from '../types';
import { EMBEDDED_BLOCK_HEADER } from '../constants';
import replaceTokens from '../utils/replaceTokens';
import parseEmbeddableFencedBlocks from './parseEmbeddableFencedBlocks';

export default (text: string, embeddings: Map<string, EmbeddableNote>, fenceOnly: boolean = false): string => {
  const entries = Object.fromEntries(embeddings);
  if (!fenceOnly) return replaceTokens(text, entries);
  return parseEmbeddableFencedBlocks(text)
    .map(item => (item.type === EMBEDDED_BLOCK_HEADER ? replaceTokens(item.content, entries) : item.content))
    .join('');
};

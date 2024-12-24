import { EmbeddableNote } from '../types';
import replaceTokens from '../utils/replaceTokens';

export default (text: string, embeddings: Map<string, EmbeddableNote>): string =>
  replaceTokens(text, Object.fromEntries(embeddings));

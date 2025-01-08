import { EMBEDDED_BLOCK_HEADER } from '../constants';
import parseFencedBlocks from './parseEmbeddableFencedBlocks';

export default (text: string): string =>
  parseFencedBlocks(text)
    .filter(item => item.type === EMBEDDED_BLOCK_HEADER)
    .map(item => item.content)
    .join('');

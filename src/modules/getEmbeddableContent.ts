import { EMBEDDED_BLOCK_HEADER } from '../constants';
import parseContent from '../utils/parseContent';

export default (text: string): string =>
  parseContent(text)
    .filter(item => item.type === EMBEDDED_BLOCK_HEADER || item.type === 'text')
    .map(item => item.text)
    .join('');

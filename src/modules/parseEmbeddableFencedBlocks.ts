import { EmbeddableBlocks } from '../types';
import { EMBEDDED_BLOCK_HEADER } from '../constants';
import escapeRegExp from '../utils/escapeRegExp';

export default (text: string): EmbeddableBlocks[] => {
  const result: EmbeddableBlocks[] = [];
  const lines = text.split(/(\r?\n)/);
  let opening: string | null = null;

  lines.forEach((line, index) => {
    const match = line.match(/^\s{0,3}(`{3,})([^`]*)(?!.*`)/);

    if (!opening && match) {
      opening = match[1];
      const type = match[2].includes(EMBEDDED_BLOCK_HEADER) ? EMBEDDED_BLOCK_HEADER : 'fence';

      result.push({ type: 'open', content: line });
      result.push({ type, content: '' });
    } else if (opening && new RegExp(`^\\s{0,3}${escapeRegExp(opening)}$`).test(line.trimEnd())) {
      opening = null;

      result.push({ type: 'close', content: line });
      result.push({ type: 'text', content: '' });
    } else if (index === 0) {
      result.push({ type: 'text', content: '' });
    } else {
      result[result.length - 1].content += line;
    }
  });

  return result;
};

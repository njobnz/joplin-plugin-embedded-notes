import { ContentSegment } from '../types';
import { EMBEDDED_BLOCK_HEADER } from '../constants';
import escapeRegExp from './escapeRegExp';

export default function (text: string): ContentSegment[] {
  const result: ContentSegment[] = [];
  const lines = text.split(/(\r?\n)/);
  let opening: string | null = null;

  lines.forEach((line, index) => {
    const match = line.match(/^\s{0,3}(`{3,})([^`]*)(?!.*`)/);

    if (!opening && match) {
      opening = match[1];
      const type = match[2].includes(EMBEDDED_BLOCK_HEADER) ? EMBEDDED_BLOCK_HEADER : 'fence';

      result.push({ type: 'open', text: line, fenced: true });
      result.push({ type: type, text: '', fenced: true });
    } else if (opening && new RegExp(`^\\s{0,3}${escapeRegExp(opening)}$`).test(line.trimEnd())) {
      opening = null;

      result.push({ type: 'close', text: line, fenced: true });
      result.push({ type: 'text', text: '', fenced: false });
    } else if (index === 0) {
      result.push({ type: 'text', text: line, fenced: false });
    } else {
      result[result.length - 1].text += line;
    }
  });

  return result;
}

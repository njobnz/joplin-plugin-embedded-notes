import { EMBEDDED_BLOCK_HEADER } from '../constants';
import escapeRegExp from './escapeRegExp';

export default (text: string): string => {
  const result = [];
  const lines = text.split(/(\r?\n)/);

  let isBlock = false;
  let isValid = false;
  let opening = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(/^\s{0,3}(`{3,})([^`]*)(?!.*`)/);

    if (match && !isBlock) {
      isBlock = true;
      isValid = match[2].includes(EMBEDDED_BLOCK_HEADER);
      opening = match[1];
      continue;
    } else if (isBlock && line.trimEnd().match(new RegExp(`^\\s{0,3}(${escapeRegExp(opening)})$`))) {
      isBlock = false;
      isValid = false;
      opening = null;
      continue;
    }

    if (!isBlock || !isValid) continue;

    result.push(line);
  }

  return result.join('');
};

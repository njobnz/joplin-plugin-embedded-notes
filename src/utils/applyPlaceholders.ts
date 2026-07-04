import { EMBEDDED_NOTES_TOKEN_EL } from '../constants';
import escapeHtmlAttr from './escapeHtmlAttr';
import parseToken from './parseToken';
import parseTokens from './parseTokens';
import parseContent from './parseContent';

const applyReplacements = (text: string, prefix: string, suffix: string): string => {
  parseTokens(text, prefix, suffix).forEach(name => {
    const info = parseToken(name, prefix, suffix);
    const hold = `<span class="${EMBEDDED_NOTES_TOKEN_EL}" data-token="${escapeHtmlAttr(info.name)}">${info.token}</span>`;
    text = text.split(info.token).join(hold);
  });

  return text;
};

export default function applyPlaceholders(text: string, prefix: string, suffix: string): string {
  let result = '';
  for (const segment of parseContent(text)) {
    result += !segment.fenced ? applyReplacements(segment.text, prefix, suffix) : segment.text;
  }
  return result;
}

import { EMBEDDED_NOTE_TOKEN_EL } from '../constants';
import escapeHtmlAttr from './escapeHtmlAttr';
import parseToken from './parseToken';
import parseTokens from './parseTokens';

export default function applyTokenPlaceholders(src: string, prefix: string, suffux: string): string {
  parseTokens(src, prefix, suffux).forEach(name => {
    const info = parseToken(name, prefix, suffux);
    const placeholder = `<span class="${EMBEDDED_NOTE_TOKEN_EL}" data-token="${escapeHtmlAttr(info.name)}">${info.token}</span>`;
    src = src.split(info.token).join(placeholder);
  });

  return src;
}

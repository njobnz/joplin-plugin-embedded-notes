import { OPEN_NOTE_CMD } from '../../../constants';
import delegate from 'delegate';

declare const webviewApi: any;

// prettier-ignore
delegate('a', 'click', (e: PointerEvent) => {
  const target = e.target as HTMLAnchorElement;
  const noteId = target.href.slice(-32);
  if (!noteId) return;
  e.preventDefault();
  webviewApi.postMessage({ command: OPEN_NOTE_CMD, noteId });
}, false);

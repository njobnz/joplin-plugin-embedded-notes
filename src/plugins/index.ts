import joplin from 'api';
import MarkdownIt from 'markdown-it';
import { ContentScriptType } from 'api/types';
import { registerSettings } from '../settings';
import { getSettings as settings } from '../utils/getSettings';
import { loadEmbeddableNotes } from '../modules/loadEmbeddableNotes';
import { findEmbeddableNotes } from '../modules/findEmbeddableNotes';
import { fetchEmbeddableNotes } from '../modules/fetchEmbeddableNotes';
import {
  markdownScriptId,
  codeMirrorScriptId,
  getFilteredTokensCmd,
  getEmbeddedLinksCmd,
} from '../constants';

export namespace App {
  const md = new MarkdownIt({ html: true });

  const getFilteredTokens = async (query: any) => {
    const noteId = (await joplin.workspace.selectedNote())?.id;
    const tokens = await findEmbeddableNotes(query?.prefix, 10);
    const filter = tokens.filter(note => note.id !== noteId);
    filter.sort((a, b) => a.title.localeCompare(b.title));
    return filter;
  };

  const getEmbeddedLinks = async () => {
    const note = await joplin.workspace.selectedNote();
    const tokens = await fetchEmbeddableNotes(note, ['id', 'title']);
    const header = `${getLargestNoteHeader(note)} ${settings().embeddedLinksHeader}`;
    const body = generateEmbeddedLinksList(tokens);
    return {
      head: md.render(header),
      body: md.render(body),
    };
  };

  const getLargestNoteHeader = (note: any) => {
    const headers = note.body.match(/^#{1,6}(?=\s)/gm);
    return headers ? '#'.repeat(Math.min(...headers.map(h => h.length))) : '#';
  };

  const generateEmbeddedLinksList = (tokens: any) => {
    const seen = new Set<string>();
    let text = '';
    tokens.forEach(token => {
      if (seen.has(token.note.id)) return;
      seen.add(token.note.id);
      text += `- [${token.note.title}](:/${token.note.id})\n`;
    });
    return text;
  };

  const onMessageHandler = async (message: any) => {
    switch (message?.command) {
      case getFilteredTokensCmd:
        return getFilteredTokens(message?.query);
      case getEmbeddedLinksCmd:
        return getEmbeddedLinks();
      default:
        console.error('Unknown command', message);
        return { error: 'Unknown command', message };
    }
  };

  const onNoteChangeHandler = async (e: any) => {
    if (e.event !== 2) return;
    loadEmbeddableNotes();
  };

  const registerMarkdown = async () => {
    await joplin.contentScripts.register(
      ContentScriptType.MarkdownItPlugin,
      markdownScriptId,
      './plugins/markdownIt/index.js'
    );
    await joplin.contentScripts.onMessage(markdownScriptId, onMessageHandler);
  };

  const registerCodeMirror = async () => {
    await joplin.contentScripts.register(
      ContentScriptType.CodeMirrorPlugin,
      codeMirrorScriptId,
      './plugins/codeMirror/index.js'
    );
    await joplin.contentScripts.onMessage(codeMirrorScriptId, onMessageHandler);
  };

  export async function init() {
    await registerSettings();
    await registerMarkdown();
    await registerCodeMirror();
    await joplin.workspace.onNoteChange(onNoteChangeHandler);
    await joplin.workspace.onNoteSelectionChange(loadEmbeddableNotes);
  }
}

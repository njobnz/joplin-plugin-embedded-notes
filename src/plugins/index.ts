import joplin from 'api';
import MarkdownIt from 'markdown-it';
import { ContentScriptType } from 'api/types';
import { EmbeddableNote } from '../types';
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
    return {
      head: md.render(generateEmbeddedLinksHead(note, settings().embeddedLinksHeader)),
      body: md.render(generateEmbeddedLinksList(tokens)),
    };
  };

  const generateEmbeddedLinksHead = (note: any, header: string) => {
    if (!header || /^#{1,6}(?=\s)/.test(header)) return header;
    const headers = note.body.match(/^#{1,6}(?=\s)/gm) || [];
    const largest = headers.length ? '#'.repeat(Math.min(...headers.map(h => h.length))) : '#';
    return `${largest} ${header}`;
  };

  const generateEmbeddedLinksList = (tokens: Map<string, EmbeddableNote>) => {
    const seen = new Set();
    return Array.from(tokens.values())
      .filter(token => !seen.has(token.note.id) && seen.add(token.note.id))
      .map((token, index) => `${index + 1}. [${token.note.title}](:/${token.note.id})`)
      .join('\n');
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

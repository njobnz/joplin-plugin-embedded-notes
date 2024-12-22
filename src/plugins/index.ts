import joplin from 'api';
import { ToolbarButtonLocation } from 'api/types';
import { EmbeddableNote, EmbeddedLinksContent, JoplinNote } from '../types';
import {
  EmbeddedLinksPosition,
  EmbeddedLinksType,
  GET_FILTERED_TOKENS_CMD,
  GET_EMBEDDED_LINKS_CMD,
  GET_SETTING_CMD,
  SET_SETTING_CMD,
  OPEN_NOTE_CMD,
} from '../constants';
import localization from '../localization';
import escapeMarkdown from '../utils/escapeMarkdown';
import replaceEscape from '../utils/replaceEscape';
import loadEmbeddableNotes from '../modules/loadEmbeddableNotes';
import findEmbeddableNotes from '../modules/findEmbeddableNotes';
import fetchEmbeddableNotes from '../modules/fetchEmbeddableNotes';
import AppSettings from './settings';
import Renderer from './renderer';
import MarkdownView from './markdownIt';
import CodeMirrorView from './codeMirror';
import EmbeddingsView from './embeddings';

export default class App {
  settings: AppSettings;
  renderer: Renderer;
  viewer: MarkdownView;
  editor: CodeMirrorView;
  panel: EmbeddingsView;

  constructor() {
    this.settings = new AppSettings(this);
    this.renderer = new Renderer(this);
    this.viewer = new MarkdownView(this);
    this.editor = new CodeMirrorView(this);
    this.panel = new EmbeddingsView(this);
  }

  setting = async (name: string, value?: any): Promise<any> => {
    if (!this.settings) throw Error('Settings not initialized.');
    if (value !== undefined) return this.settings.set(name, value);
    return this.settings.get(name);
  };

  onMessageHandler = async (message: any): Promise<any> => {
    switch (message?.command) {
      case GET_FILTERED_TOKENS_CMD:
        return this.getFilteredTokens(message?.query);
      case GET_EMBEDDED_LINKS_CMD:
        return await this.getEmbeddedLinks(!!message?.isFound);
      case GET_SETTING_CMD:
        return await this.setting(message?.name);
      case SET_SETTING_CMD:
        return await this.setting(message?.name, message?.value);
      case OPEN_NOTE_CMD:
        try {
          if (!message?.noteId) throw Error('Note ID is missing.');
          return await joplin.commands.execute('openNote', message.noteId);
        } catch (exception) {
          console.error('Cannot open note:', exception, message);
          return { error: 'Cannot open note:', exception, message };
        }
      default:
        console.error('Unknown command:', message);
        return { error: 'Unknown command:', message };
    }
  };

  onNoteChangeHandler = (e: any): void => {
    if (e.event !== 2) return;
    loadEmbeddableNotes();
  };

  getFilteredTokens = async (query: any): Promise<JoplinNote[]> => {
    const noteId = (await joplin.workspace.selectedNote())?.id;
    const tokens = await findEmbeddableNotes(query?.prefix, 10);
    const filter = tokens.filter(note => note.id !== noteId);
    filter.sort((a, b) => a.title.localeCompare(b.title));
    return filter;
  };

  getEmbeddedLinks = async (isFound: boolean = false, isPanel: boolean = false): Promise<EmbeddedLinksContent> => {
    const result: EmbeddedLinksContent = {
      position: EmbeddedLinksPosition.Footer,
      hide: true,
      head: '',
      body: '',
    };

    result.position = (await this.setting('listPosition')) as EmbeddedLinksPosition;
    if (!isFound && result.position === EmbeddedLinksPosition.None) return result;

    const note = (await joplin.workspace.selectedNote()) as JoplinNote;
    if ((!isPanel && !note) || !note) return result;

    const notes = await fetchEmbeddableNotes(note, ['id', 'title']);
    result.hide = notes.size === 0;

    if (isPanel || !result.hide) {
      const [delimiter, header, type] = await Promise.all([
        this.setting('listDelimiter'),
        this.setting('listHeader'),
        this.setting('listType'),
      ]);

      result.head = this.renderer.render(this.generateEmbeddedLinksHead(note, header));
      result.body = this.renderer.render(this.generateEmbeddedLinksList(notes, type, delimiter));
    }

    return result;
  };

  generateEmbeddedLinksHead = (note: any, header: string): string => {
    if (!header || /^#{1,6}(?=\s)/.test(header)) return header;
    const headers = note.body.match(/^#{1,6}(?=\s)/gm) || [];
    const largest = headers.length ? '#'.repeat(Math.min(...headers.map(h => h.length))) : '#';
    return `${largest} ${header}`;
  };

  generateEmbeddedLinksList = (
    tokens: Map<string, EmbeddableNote>,
    type: EmbeddedLinksType = EmbeddedLinksType.Delimited,
    delimiter: string = '\n'
  ): string => {
    if (!tokens.size) return '';

    const formatPrefix = (index: number): string => {
      switch (type) {
        case EmbeddedLinksType.Ordered:
          return `${index}. `;
        case EmbeddedLinksType.Unordered:
          return '- ';
        default:
          return '';
      }
    };

    const unique = Array.from(tokens.values()).filter(
      (token, _, arr) => arr.findIndex(t => t.note.id === token.note.id) === arr.indexOf(token)
    );

    const links = unique.map(
      (token, index) => `${formatPrefix(index + 1)}[${escapeMarkdown(token.note.title)}](:/${token.note.id})`
    );

    delimiter = type === EmbeddedLinksType.Delimited ? replaceEscape(delimiter) : '\n';
    return links.join(delimiter);
  };

  registerToggleEmbeddingsPanelCmd = async () => {
    await joplin.commands.register({
      name: 'toggleEmbeddingsPanel',
      label: localization.command_toggleEmbeddingsPanel,
      iconName: 'fas fa-laptop-code',
      execute: async () => {
        if (!this.panel) return;
        await this.setting('showPanel', !(await this.setting('showPanel')));
        this.panel.refresh();
      },
    });

    await joplin.views.toolbarButtons.create(
      'toggleEmbeddingsPanelToolbar',
      'toggleEmbeddingsPanel',
      ToolbarButtonLocation.NoteToolbar
    );
  };

  init = async (): Promise<void> => {
    await this.settings.init();
    await this.viewer.init();
    await this.editor.init();
    await this.panel.init();

    await this.registerToggleEmbeddingsPanelCmd();

    await joplin.workspace.onNoteChange(this.onNoteChangeHandler);
    await joplin.workspace.onNoteSelectionChange(loadEmbeddableNotes);
  };
}

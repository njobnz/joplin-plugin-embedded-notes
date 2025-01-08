import joplin from 'api';
import { ToolbarButtonLocation } from 'api/types';
import { EmbeddableNote, EmbeddedLinksContent, JoplinNote } from '../types';
import {
  EmbeddedLinksPosition,
  EmbeddedLinksType,
  GET_FILTERED_TOKENS_CMD,
  GET_EMBEDDED_LINKS_CMD,
  GET_SETTINGS_CMD,
  GET_SETTING_CMD,
  SET_SETTING_CMD,
  OPEN_NOTE_CMD,
  GET_DATA_CMD,
  GET_GLOBAL_VALUE_CMD,
} from '../constants';
import localization from '../localization';
import escapeMarkdown from '../utils/escapeMarkdown';
import replaceEscape from '../utils/replaceEscape';
import loadEmbeddableNotes from '../modules/loadEmbeddableNotes';
import findEmbeddableNotes from '../modules/findEmbeddableNotes';
import fetchEmbeddableNotes from '../modules/fetchEmbeddableNotes';
import generateEmbeddedNote from '../modules/generateEmbeddedNote';
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

  setting = async <T>(name: string, value?: T): Promise<T> => {
    if (!this.settings) throw Error('Settings not initialized.');
    if (value !== undefined) {
      await this.settings.set(name, value);
      return value;
    }
    return await this.settings.get<T>(name);
  };

  onMessageHandler = async (message: any): Promise<any> => {
    switch (message?.command) {
      case GET_FILTERED_TOKENS_CMD:
        return this.getFilteredTokens(message?.query);
      case GET_EMBEDDED_LINKS_CMD:
        return await this.getEmbeddedLinks(!!message?.isFound);
      case GET_GLOBAL_VALUE_CMD:
        return await joplin.settings.globalValue(message?.name);
      case GET_SETTINGS_CMD:
        const values = message?.values;
        if (!Array.isArray(values)) return {};
        const settings = await Promise.all(values.map(async name => await this.setting(name)));
        return values.reduce((obj, key, index) => ({ ...obj, [key]: settings[index] }), {});
      case GET_SETTING_CMD:
        return await this.setting(message?.name);
      case SET_SETTING_CMD:
        return await this.setting(message?.name, message?.value);
      case GET_DATA_CMD:
        try {
          return await joplin.data.get(message?.path, message?.query);
        } catch (exception) {
          return null;
        }
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
    const note = await joplin.workspace.selectedNote();
    if (!note || note.body.includes(await this.setting<string>('disableText'))) return [];

    const tokens = await findEmbeddableNotes(query?.prefix, ['id', 'title'], 10);
    const filter = tokens.filter(item => item.id !== note.id);
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

    result.position = (await this.setting<EmbeddedLinksPosition>('listPosition')) as EmbeddedLinksPosition;
    if (!isFound && result.position === EmbeddedLinksPosition.None) return result;

    const note = (await joplin.workspace.selectedNote()) as JoplinNote;
    if ((!isPanel && !note) || !note) return result;

    result.head = this.renderer.render(this.generateEmbeddedLinksHead(note, await this.setting<string>('listHeader')));

    if (note.body.includes(await this.setting<string>('disableText'))) {
      result.body = this.renderer.render(localization.message__tokensDisabled);
      return result;
    }

    const notes = await fetchEmbeddableNotes(note, ['id', 'title']);
    result.hide = notes.size === 0;

    if (isPanel || !result.hide)
      result.body = this.renderer.render(
        this.generateEmbeddedLinksList(
          notes,
          await this.setting<EmbeddedLinksType>('listType'),
          await this.setting<string>('listDelimiter')
        )
      );

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
        const state = !(await this.setting<boolean>('showPanel'));
        await this.setting<boolean>('showPanel', state);
        this.panel.refresh();
      },
    });

    await joplin.views.toolbarButtons.create(
      'toggleEmbeddingsPanelToolbar',
      'toggleEmbeddingsPanel',
      ToolbarButtonLocation.NoteToolbar
    );
  };

  registerCreateNoteWithEmbeddedContentCmd = async () => {
    await joplin.commands.register({
      name: 'createNoteWithEmbeddedContent',
      label: localization.command_createNoteWithEmbeddedContent,
      iconName: 'fas fa-clone',
      execute: async () => {
        const note = (await joplin.workspace.selectedNote()) as JoplinNote;
        if (!note) return;

        const embeddings = await fetchEmbeddableNotes(note);
        if (!embeddings) return;

        const title = `${note.title}${await this.setting<string>('newNoteTitle')}`;
        const body = generateEmbeddedNote(note.body, embeddings);
        const copy = await joplin.data.post(['notes'], null, {
          body,
          title,
          parent_id: note.parent_id,
          is_todo: note.is_todo,
        });

        await joplin.commands.execute('openNote', copy.id);
      },
    });

    await joplin.views.toolbarButtons.create(
      'createNoteWithEmbeddedContentToolbar',
      'createNoteWithEmbeddedContent',
      ToolbarButtonLocation.EditorToolbar
    );
  };

  createBacklinksMenus = async () => {
    await joplin.views.menus.create('embeddedNotesMenu', 'Embedded notes', [
      {
        commandName: 'createNoteWithEmbeddedContent',
        accelerator: 'Ctrl+Alt+E',
      },
    ]);
  };

  init = async (): Promise<void> => {
    await this.settings.init();
    await this.renderer.init();
    await this.viewer.init();
    await this.editor.init();
    await this.panel.init();

    await this.registerToggleEmbeddingsPanelCmd();
    await this.registerCreateNoteWithEmbeddedContentCmd();
    await this.createBacklinksMenus();

    await joplin.workspace.onNoteChange(this.onNoteChangeHandler);
    await joplin.workspace.onNoteSelectionChange(loadEmbeddableNotes);
    loadEmbeddableNotes();
  };
}

export const MARKDOWNIT_SCRIPT_ID: string = 'tuibyte.EmbeddedNotes.MarkdownIt';
export const CODE_MIRROR_SCRIPT_ID: string = 'tuibyte.EmbeddedNotes.CodeMirror';

export const SETTINGS_SECTION_NAME: string = 'tuibyte-embedded-notes';

export const LOCAL_STORE_NOTES_KEY: string = 'tuibyte.EmbeddedNotes.Notes';
export const LOCAL_STORE_SETTINGS_KEY: string = 'tuibyte.EmbeddedNotes.Settings';

export const LOCAL_STORE_SETTINGS: string[] = ['autocomplete', 'fenceOnly', 'idOnly', 'prefix', 'showIcon', 'suffix'];

export const EMBEDDED_LINKS_PANEL_EL: string = 'embedded-notes-panel';
export const EMBEDDED_LINKS_PANEL_ID: string = 'embedded_notes_panel';
export const GET_FILTERED_TOKENS_CMD: string = 'getFilteredTokens';
export const GET_EMBEDDED_LINKS_CMD: string = 'getEmbeddedLinks';
export const GET_SETTING_CMD: string = 'getSetting';
export const SET_SETTING_CMD: string = 'setSetting';
export const OPEN_NOTE_CMD: string = 'openNote';

export const MARKDOWNIT_RULERS = [
  'footnote_tail2', // https://github.com/ambrt/joplin-plugin-referencing-notes/blob/4469dd69ecb4eeed97bb270ebfa508448c2bbd2b/src/notesReferences.js#L43
  'reference_list', // https://github.com/joplin/plugin-bibtex/blob/bfb9e2098d55b8061c43380fd581f6dd8d621d4b/src/ui/bibliography-renderer/render-list-content-script.ts#L12
];

export enum EmbeddedLinksPosition {
  Footer,
  Header,
  None,
}

export enum EmbeddedLinksType {
  Ordered,
  Unordered,
  Delimited,
}

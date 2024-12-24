export const MARKDOWNIT_SCRIPT_ID: string = 'tuibyte.EmbeddedNotes.MarkdownIt';
export const CODE_MIRROR_SCRIPT_ID: string = 'tuibyte.EmbeddedNotes.CodeMirror';

export const LOCAL_STORE_NOTES_KEY: string = 'tuibyte.EmbeddedNotes.Notes';
export const LOCAL_STORE_SETTINGS_KEY: string = 'tuibyte.EmbeddedNotes.Settings';

export const SETTINGS_SECTION_NAME: string = 'tuibyte-embedded-notes';

export const EMBEDDED_LINKS_PANEL_EL: string = 'embedded-notes-panel';
export const EMBEDDED_LINKS_PANEL_ID: string = 'embedded_notes_panel';
export const GET_FILTERED_TOKENS_CMD: string = 'getFilteredTokens';
export const GET_EMBEDDED_LINKS_CMD: string = 'getEmbeddedLinks';
export const GET_SETTING_CMD: string = 'getSetting';
export const SET_SETTING_CMD: string = 'setSetting';
export const OPEN_NOTE_CMD: string = 'openNote';

export const NON_ASYNC_SETTINGS = ['autocomplete', 'fenceOnly', 'idOnly', 'prefix', 'showIcon', 'suffix'];

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

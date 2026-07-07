import { EmbeddedLinksPosition, EmbeddedLinksType } from './constants';

export interface PluginSettings {
  autocomplete: boolean;
  fenceOnly: boolean;
  idOnly: boolean;
  tag: string;
  prefix: string;
  suffix: string;
  listPosition: EmbeddedLinksPosition;
  listType: EmbeddedLinksType;
  showPanel: boolean;
  showIcon: boolean;
  newNoteTitle: string;
  listHeader: string;
  listDelimiter: string;
  recursionDepth: number;
  customCss: string;
  disableText: string;
}

export interface EmbeddableNote {
  note: JoplinNote;
  info: TokenInfo;
  depth: number;
}

export interface EmbeddedLinksContent {
  position: EmbeddedLinksPosition;
  hide: boolean;
  head: string;
  body: string;
}

export interface ContentSegment {
  type: string;
  text: string;
  fenced: boolean;
}

export interface TokenInfo {
  name: string;
  input: string;
  token: string;
}

export interface JoplinNote {
  id: string;
  parent_id: string;
  title: string;
  body: string;
  is_todo: boolean;
}

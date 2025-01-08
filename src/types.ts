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
  showResources: boolean;
  newNoteTitle: string;
  listHeader: string;
  listDelimiter: string;
  customCss: string;
  disableText: string;
}

export interface EmbeddableNote {
  note: JoplinNote;
  info: TokenInfo;
}

export interface EmbeddableBlocks {
  type: string;
  content: string;
}

export interface EmbeddedLinksContent {
  position: EmbeddedLinksPosition;
  hide: boolean;
  head: string;
  body: string;
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

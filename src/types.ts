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
  listHeader: string;
  listDelimiter: string;
  customCss: string;
  disableText: string;
}

export interface EmbeddableNote {
  note: JoplinNote;
  info: TokenInfo;
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

export interface TokenRenderers {
  markdown: boolean;
  inline: boolean;
  text: boolean;
}

export interface JoplinNote {
  id: string;
  parent_id: string;
  title: string;
  body: string;
  is_todo: boolean;
}

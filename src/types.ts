import { EmbeddedLinksPosition, EmbeddedLinksType } from './constants';

export interface PluginSettings {
  autocomplete: boolean;
  fenceOnly: boolean;
  idOnly: boolean;
  tag: string;
  prefix: string;
  suffix: string;
  blockFence: boolean;
  disableText: string;
  renderMarkdown: boolean;
  rendererTags: string[];
  listPosition: EmbeddedLinksPosition;
  listType: EmbeddedLinksType;
  showIcon: boolean;
  showPanel: boolean;
  listHeader: string;
  listDelimiter: string;
  customCss: string;
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
  tag: string;
  token: string;
  renderer: TokenRenderers;
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

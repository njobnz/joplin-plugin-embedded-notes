export interface PluginSettings {
  autocomplete: boolean;
  embeddedLinks: boolean;
  fenceOnly: boolean;
  idOnly: boolean;
  tag: string;
  prefix: string;
  suffix: string;
  blockFence: boolean;
  renderMarkdown: boolean;
  rendererTags: string[];
  embeddedLinksHeader: string;
}

export interface EmbeddableNote {
  note: any;
  info: TokenInfo;
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

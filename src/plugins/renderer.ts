import MarkdownIt from 'markdown-it';
import AppSettings from './settings';
import App from '.';

export default class Renderer {
  app: App = null;
  settings: AppSettings;
  markdown: MarkdownIt;

  constructor(app: App) {
    if (!app) throw Error('app cannot be null');
    this.app = app;
    this.settings = app.settings;

    this.markdown = new MarkdownIt({ breaks: true });
    this.markdown.renderer.rules.link_open = (tokens, idx, _options, _env, _self) => {
      const href = tokens[idx].attrGet('href');
      const icon = this.settings.read<boolean>('showIcon') ? '<span class="resource-icon fa-joplin"></span>' : '';
      return `<a href="${href}">${icon}`;
    };
  }

  render = (text: string) => this.markdown.render(text);
}

import MarkdownIt from 'markdown-it';
import App from '.';

export default class Renderer {
  app: App = null;
  markdown: MarkdownIt = null;

  constructor(app: App) {
    if (!app) throw Error('app cannot be null');
    this.app = app;
    this.markdown = new MarkdownIt({ breaks: true });
  }

  render = (text: string) => this.markdown.render(text);

  async init() {
    const showIcon = await this.app.setting<boolean>('showIcon');

    this.markdown.renderer.rules.link_open = (tokens, idx, _options, _env, _self) => {
      const href = tokens[idx].attrGet('href');
      const icon = showIcon ? '<span class="resource-icon fa-joplin"></span>' : '';
      return `<a href="${href}">${icon}`;
    };
  }
}

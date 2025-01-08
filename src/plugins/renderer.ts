import joplin from 'api';
import { MarkupLanguage } from '../constants';
import MarkdownIt from 'markdown-it';
import App from '.';

export default class Renderer {
  app: App = null;
  markdown: MarkdownIt = null;
  options: any = {};
  canRender: boolean = false;
  showIcon: boolean = false;

  constructor(app: App, options: any = {}) {
    if (!app) throw Error('app cannot be null');
    this.app = app;
    this.markdown = new MarkdownIt({ breaks: true });
    this.options = {
      bodyOnly: true,
      ...options,
    };
  }

  // https://github.com/laurent22/joplin/blob/e1e2ba8888ea290a76cdb573f50b9f7a0f25da58/packages/lib/commands/renderMarkup.ts#L23
  // https://github.com/laurent22/joplin/blob/e1e2ba8888ea290a76cdb573f50b9f7a0f25da58/packages/renderer/types.ts#L20
  // https://github.com/laurent22/joplin/blob/e1e2ba8888ea290a76cdb573f50b9f7a0f25da58/packages/renderer/MdToHtml.ts#L466
  render = async (text: string, options: any = {}) => {
    this.showIcon = await this.app.setting<boolean>('showIcon');

    return this.canRender
      ? (
          await joplin.commands.execute('renderMarkup', MarkupLanguage.Markdown, text, null, {
            ...this.options,
            ...options,
          })
        ).html
      : this.markdown.render(text);
  };

  async init() {
    const version = (await joplin.versionInfo()).version.match(/^([0-9]+\.[0-9]+\.[0-9]+)*$/)[1];
    this.canRender = version.localeCompare('3.2.2', undefined, { numeric: true, sensitivity: 'base' }) >= 0;
    this.showIcon = await this.app.setting<boolean>('showIcon');

    this.markdown.renderer.rules.link_open = (tokens, idx, _options, _env, _self) => {
      const href = tokens[idx].attrGet('href');
      const match = /^\:\/([0-9A-Fa-f]{32})$/.test(href);
      const icon = this.showIcon && match ? '<span class="resource-icon fa-joplin"></span>' : '';
      return `<a href="${href}">${icon}`;
    };
  }
}

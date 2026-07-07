import joplin from 'api';
import { MarkupLanguage } from '../constants';
import App from '.';

export default class Renderer {
  app: App;
  options: any = {};

  constructor(app: App, options: any = {}) {
    if (!app) throw Error('app cannot be null');
    this.app = app;
    this.options = {
      bodyOnly: true,
      ...options,
    };
  }

  // https://github.com/laurent22/joplin/blob/f7f7ba10e2a55bd8a7c9cd09dc439650a07d84e3/packages/lib/commands/renderMarkup.ts#L29
  // https://github.com/laurent22/joplin/blob/f7f7ba10e2a55bd8a7c9cd09dc439650a07d84e3/packages/renderer/types.ts#L96
  // https://github.com/laurent22/joplin/blob/f7f7ba10e2a55bd8a7c9cd09dc439650a07d84e3/packages/renderer/MdToHtml.ts#L456
  render = async (text: string, options: any = {}): Promise<string> => {
    const rendered = await joplin.commands.execute('renderMarkup', MarkupLanguage.Markdown, text, null, {
      ...this.options,
      ...options,
    });
    return rendered.html;
  };
}

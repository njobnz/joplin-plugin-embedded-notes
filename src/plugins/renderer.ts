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

  // https://github.com/laurent22/joplin/blob/e1e2ba8888ea290a76cdb573f50b9f7a0f25da58/packages/lib/commands/renderMarkup.ts#L23
  // https://github.com/laurent22/joplin/blob/e1e2ba8888ea290a76cdb573f50b9f7a0f25da58/packages/renderer/types.ts#L20
  // https://github.com/laurent22/joplin/blob/e1e2ba8888ea290a76cdb573f50b9f7a0f25da58/packages/renderer/MdToHtml.ts#L466
  render = async (text: string, options: any = {}) => {
    return (
      await joplin.commands.execute('renderMarkup', MarkupLanguage.Markdown, text, null, {
        ...this.options,
        ...options,
      })
    ).html;
  };
}

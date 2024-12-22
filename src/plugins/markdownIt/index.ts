import joplin from 'api';
import { ContentScriptType } from 'api/types';
import { MARKDOWNIT_SCRIPT_ID } from '../../constants';
import App from '..';

export default class MarkdownView {
  app: App = null;

  constructor(app: App) {
    if (!app) throw Error('app cannot be null');
    this.app = app;
  }

  init = async (): Promise<void> => {
    await joplin.contentScripts.register(
      ContentScriptType.MarkdownItPlugin,
      MARKDOWNIT_SCRIPT_ID,
      './plugins/markdownIt/plugin.js'
    );
    await joplin.contentScripts.onMessage(MARKDOWNIT_SCRIPT_ID, this.app.onMessageHandler);
  };
}

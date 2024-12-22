import joplin from 'api';
import { ContentScriptType } from 'api/types';
import { CODE_MIRROR_SCRIPT_ID } from '../../constants';
import App from '..';

export default class CodeMirrorView {
  app: App = null;

  constructor(app: App) {
    if (!app) throw Error('app cannot be null');
    this.app = app;
  }

  init = async (): Promise<void> => {
    await joplin.contentScripts.register(
      ContentScriptType.CodeMirrorPlugin,
      CODE_MIRROR_SCRIPT_ID,
      './plugins/codeMirror/plugin.js'
    );
    await joplin.contentScripts.onMessage(CODE_MIRROR_SCRIPT_ID, this.app.onMessageHandler);
  };
}

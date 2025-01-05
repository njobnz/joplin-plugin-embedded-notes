import joplin from 'api';
import { ViewHandle } from 'api/types';
import { EMBEDDED_LINKS_PANEL_EL, EMBEDDED_LINKS_PANEL_ID } from '../../constants';
import localization from '../../localization';
import debounce from '../../utils/debounce';
import App from '..';

let fs: any = null;

export default class EmbeddingsView {
  app: App = null;
  panel: ViewHandle = null;
  setting: <T>(name: string) => Promise<T> = null;

  constructor(app: App) {
    if (!app) throw Error('app cannot be null');
    this.app = app;
  }

  onNoteChangeHandler = (e: any): void => {
    if (e.event !== 2) return;
    debounce(this.refresh, 500)();
  };

  content = async (text: string = ''): Promise<string> => {
    const html = text && text !== '' ? text : this.app.renderer.render(localization.message__reloadPanel);
    const path = await this.setting<string>('customCss');
    const style = fs && fs.existsSync(path) ? `<style>${fs.readFileSync(path, 'utf-8')}</style>` : '';
    return `${style}<div id="${EMBEDDED_LINKS_PANEL_EL}">${html}</div>`;
  };

  build = async (): Promise<void> => {
    if (!this.app && this.panel) return;

    this.panel = await joplin.views.panels.create(EMBEDDED_LINKS_PANEL_ID);
    const html = this.app.renderer.render(localization.message__reloadPanel);

    await joplin.views.panels.setHtml(this.panel, await this.content(html));
    await joplin.views.panels.addScript(this.panel, './plugins/embeddings/assets/panel.css');
    await joplin.views.panels.addScript(this.panel, './plugins/embeddings/assets/panel.js');
    await joplin.views.panels.onMessage(this.panel, this.app.onMessageHandler);
    await joplin.views.panels.show(this.panel);
  };

  refresh = async (): Promise<void> => {
    if (!this.app) return;

    if (await this.setting<boolean>('showPanel')) {
      if (!this.panel) {
        await this.build();
      } else {
        await joplin.views.panels.show(this.panel);
      }

      if (this.panel) {
        const links = await this.app.getEmbeddedLinks(true, true);
        links.head = links.head.replace(/<\/?h[1-6]\b/g, match => (match[1] === '/' ? '</h1' : '<h1'));
        await joplin.views.panels.setHtml(this.panel, await this.content(`${links.head}${links.body}`));
      } else {
        console.error('Failed to initialize embedded links panel.');
      }
    } else if (this.panel) {
      await joplin.views.panels.hide(this.panel);
    }
  };

  init = async (): Promise<void> => {
    this.setting = this.app.setting;

    try {
      fs = await import('fs');
    } catch (e) {}

    await joplin.settings.onChange(this.refresh);
    await joplin.workspace.onNoteChange(this.onNoteChangeHandler);
    await joplin.workspace.onNoteSelectionChange(this.refresh);
  };
}

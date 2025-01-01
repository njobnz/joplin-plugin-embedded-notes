import { EmbeddedLinksContent } from '../../../types';
import {
  EmbeddedLinksPosition,
  GET_DATA_CMD,
  GET_EMBEDDED_LINKS_CMD,
  GET_GLOBAL_VALUE_CMD,
  GET_SETTING_CMD,
  MARKDOWNIT_SCRIPT_ID,
} from '../../../constants';
import escapeRegExp from '../../../utils/escapeRegExp';

declare const webviewApi: any;

export class EmbeddedNotes {
  readonly contentId = 'rendered-md';
  readonly headerId = 'embedded-notes-header';

  findHeaderByName(name: string, el: Element): Element | null {
    if (!el || !name?.trim()) return null;
    return (
      Array.from(el.children).find(child => child.tagName.startsWith('H') && child.textContent?.trim() === name) || null
    );
  }

  async fetchData<T>(path: string[], query: any): Promise<T> {
    return await webviewApi.postMessage(MARKDOWNIT_SCRIPT_ID, {
      command: GET_DATA_CMD,
      path,
      query,
    });
  }

  async fetchSetting<T>(name: string): Promise<T> {
    return await webviewApi.postMessage(MARKDOWNIT_SCRIPT_ID, {
      command: GET_SETTING_CMD,
      name,
    });
  }

  async fetchEmbeddings(isFound: boolean): Promise<EmbeddedLinksContent> {
    return await webviewApi.postMessage(MARKDOWNIT_SCRIPT_ID, {
      command: GET_EMBEDDED_LINKS_CMD,
      isFound,
    });
  }

  insertEmbeddings(content: Element, heading: Element | null, backlinks: EmbeddedLinksContent): void {
    const { head = '', body = '', position = EmbeddedLinksPosition.None } = backlinks;

    if (heading) {
      heading.insertAdjacentHTML('afterend', body);
      return;
    }

    if (position === EmbeddedLinksPosition.None) return;

    const insert = position === EmbeddedLinksPosition.Header ? 'afterbegin' : 'beforeend';
    content.insertAdjacentHTML(insert, head + body);
  }

  async writeEmbeddigs(): Promise<void> {
    const content = document.getElementById(this.contentId);
    if (!content) return;

    const name = (await this.fetchSetting<string>('listHeader')).replace(/^#{1,6}\s+/gm, '');
    const header = document.getElementById(this.headerId) ?? this.findHeaderByName(name, content);

    const embeddings = await this.fetchEmbeddings(Boolean(header));
    if (embeddings.hide) return;

    this.insertEmbeddings(content, header, embeddings);
  }

  async updateResources(): Promise<void> {
    const pattern = new RegExp(`^joplin-content:\/\/note-viewer\/(.*)\/\/([0-9A-Fa-f]{32})$`);
    const elements = document.querySelectorAll('video[src], audio[src], source[src], img[src]') as any;

    elements.forEach(async img => {
      if (!pattern.test(img.src)) return;

      const resourceId = img.src.slice(-32);
      const { file_extension } = (await this.fetchData(['resources', resourceId], {
        fields: ['file_extension'],
      })) as any;

      if (file_extension) img.src = `${img.src}.${file_extension}`;
    });
  }

  async noteUpdateHandler(): Promise<void> {
    await this.writeEmbeddigs();
    await this.updateResources();
  }

  init(): void {
    this.noteUpdateHandler();
    document.addEventListener('joplin-noteDidUpdate', () => this.noteUpdateHandler());
  }
}

new EmbeddedNotes().init();

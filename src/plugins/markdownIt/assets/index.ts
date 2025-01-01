import { EmbeddedLinksContent } from '../../../types';
import {
  EmbeddedLinksPosition,
  GET_DATA_CMD,
  GET_EMBEDDED_LINKS_CMD,
  GET_SETTING_CMD,
  MARKDOWNIT_SCRIPT_ID,
} from '../../../constants';

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
    const elements = document.querySelectorAll('a[href], img[src]') as any;
    const pattern = /^joplin-content:\/\/note-viewer\/(.*)\/\/([0-9A-Fa-f]{32})$/;

    for (const element of elements) {
      const resourceUrl = element.src || element.title;
      if (!pattern.test(resourceUrl)) continue;
      const resourceId = resourceUrl.slice(-32);

      if (element.tagName === 'IMG') {
        const { file_extension } = (await this.fetchData(['resources', resourceId], {
          fields: ['file_extension'],
        })) as any;
        if (file_extension) element.src = `${resourceUrl}.${file_extension}?t=${Date.now()}`;
        continue;
      }

      if (element.tagName !== 'A') continue;

      const { title, mime, file_extension } = (await this.fetchData(['resources', resourceId], {
        fields: ['title', 'mime', 'file_extension'],
      })) as any;

      element.setAttribute('data-resource-id', resourceId);
      element.setAttribute('title', title);
      element.setAttribute('type', mime);
      element.setAttribute(
        'onclick',
        `ipcProxySendToHost("joplin://${resourceId}", { resourceId: "${resourceId}" }); return false;`
      );

      const type = mime.split('/')[0];
      const icon = ['audio', 'video', 'image'].includes(type) ? `-${type}` : '';

      const iconEl = document.createElement('span');
      iconEl.className = `resource-icon fa-file${icon}`;
      element.prepend(iconEl);

      const resourceEl = element.nextElementSibling;
      if (['audio', 'video'].includes(type) && (!resourceEl || resourceEl.tagName !== type.toUpperCase())) {
        const mediaEl = document.createElement(type);
        mediaEl.className = `media-player media-${type}`;
        mediaEl.controls = true;

        const sourceEl = document.createElement('source');
        sourceEl.src = `${resourceUrl}.${file_extension}`;
        sourceEl.type = mime;

        mediaEl.appendChild(sourceEl);
        element.after(mediaEl);
      }
    }
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

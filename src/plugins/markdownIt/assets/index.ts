import { EmbeddedLinksContent } from '../../../types';
import {
  EmbeddedLinksPosition,
  GET_DATA_CMD,
  GET_EMBEDDED_LINKS_CMD,
  GET_GLOBAL_VALUE_CMD,
  GET_SETTING_CMD,
  MARKDOWNIT_SCRIPT_ID,
} from '../../../constants';
import { getClassNameForMimeType } from 'font-awesome-filetypes';

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

  async fetchGlobal<T>(name: string): Promise<T> {
    return await webviewApi.postMessage(MARKDOWNIT_SCRIPT_ID, {
      command: GET_GLOBAL_VALUE_CMD,
      name,
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
    const pattern = /^joplin-content:\/\/note-viewer\/(.*)\/\/([0-9A-Fa-f]{32})(|#[^\s]*)(|\s".*?")$/;

    for (const element of elements) {
      const resourceUrl = element.src || element.href;
      const match = resourceUrl.match(pattern);
      if (!match) continue;
      const resourceId = match[2];

      const resource = (await this.fetchData(['resources', resourceId], {
        fields: element.tagName === 'IMG' ? ['file_extension'] : ['title', 'mime', 'file_extension'],
      })) as any;

      if (element.tagName === 'IMG') {
        if (resource.file_extension) element.src = `${resourceUrl}.${resource.file_extension}?t=${Date.now()}`;
      }

      if (element.tagName === 'A') {
        const { title, mime, file_extension } = resource;
        element.setAttribute('data-resource-id', resourceId);
        element.setAttribute('title', title);
        element.setAttribute('type', mime);
        element.setAttribute('href', `${element.href}.${file_extension}`);
        element.setAttribute(
          'onclick',
          `ipcProxySendToHost("joplin://${resourceId}", { resourceId: "${resourceId}" }); return false;`
        );

        const icon = mime ? getClassNameForMimeType(mime) : 'fa-joplin';
        const iconEl = document.createElement('span');
        iconEl.className = `resource-icon ${icon}`;
        element.prepend(iconEl);

        const type = mime.split('/')[1] === 'pdf' ? 'pdf' : mime.split('/')[0];
        if (['audio', 'video', 'pdf'].includes(type)) {
          const isPdf = type === 'pdf';
          const globalName = isPdf ? 'pdfViewer' : `${type}Player`;
          const isEnabled = await this.fetchGlobal<boolean>(`markdown.plugin.${globalName}`);
          const resourceEl = element.nextElementSibling;

          if (isEnabled && (!resourceEl || resourceEl.tagName !== type.toUpperCase())) {
            const mediaEl = document.createElement(isPdf ? 'object' : type);
            mediaEl.className = `media-player media-${type}`;

            if (isPdf) {
              mediaEl.data = `${resourceUrl}.${file_extension}`;
              mediaEl.type = mime;
            } else {
              const sourceEl = document.createElement('source');
              sourceEl.src = `${resourceUrl}.${file_extension}`;
              sourceEl.type = mime;

              mediaEl.controls = true;
              mediaEl.appendChild(sourceEl);
            }

            element.after(mediaEl);
          }
        }
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

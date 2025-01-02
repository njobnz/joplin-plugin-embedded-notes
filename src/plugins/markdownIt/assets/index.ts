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

  /*
   * Parses URLs set in `replaceResourceUrls` and builds resource elements.
   * See `replaceResourceUrls` in `replaceTokens.ts` for more information.
   */
  async updateResources(): Promise<void> {
    const elements = document.querySelectorAll('a[href], img[src]') as any;
    const pattern = /^(joplin-content:\/\/note-viewer\/.*\/\/([0-9A-Fa-f]{32}))(|#[^\s]*)$/;

    for (const element of elements) {
      const match = (element.src || element.href).match(pattern);
      if (!match) continue;

      const [, url, id, hash] = match;

      const onClick = [
        'onclick',
        `ipcProxySendToHost("joplin://${id}${hash}", { resourceId: "${id}" }); return false;`,
      ];

      const resource = (await this.fetchData(['resources', id], {
        fields: ['title', 'mime', 'file_extension'],
      })) as any;

      const mime = resource?.mime;
      const href = resource?.file_extension ? `${url}.${resource.file_extension}` : url;

      // Update internal embedded image src attributes
      if (element.tagName === 'IMG') {
        element.src = `${href}?t=${Date.now()}`;
        continue;
      }

      if (element.tagName !== 'A') continue;

      // Create internal embedded note and resource anchor tags
      if (pattern.test(element.title) && resource?.title !== null) {
        element.setAttribute('title', resource.title);
      }
      element.setAttribute('data-resource-id', id);
      element.setAttribute('href', resource ? href : '#');
      element.setAttribute(...onClick);

      // Build resource icon
      const iconEl = document.createElement('span');
      iconEl.className = `resource-icon ${mime ? getClassNameForMimeType(mime) : 'fa-joplin'}`;
      element.prepend(iconEl);

      if (!resource) continue;

      // Create internal embedded resource containers for video, audio and pdfs
      const type = mime.split('/')[1] === 'pdf' ? 'pdf' : mime.split('/')[0];
      if (!['audio', 'video', 'pdf'].includes(type)) continue;
      const isPdf = type === 'pdf';

      // Test if the markdown plugin for the resource type is enabled
      const isEnabled = await this.fetchGlobal<boolean>(`markdown.plugin.${isPdf ? 'pdfViewer' : `${type}Player`}`);

      // Test if the container for the resource type already exists
      const resourceEl = element.nextElementSibling;
      if (!isEnabled || resourceEl?.tagName === type.toUpperCase()) continue;

      // Create the container for the resource type
      const mediaEl = document.createElement(isPdf ? 'object' : type);
      mediaEl.className = `media-player media-${type}`;

      if (isPdf) {
        mediaEl.data = href;
        mediaEl.type = mime;
      } else {
        const sourceEl = document.createElement('source');
        sourceEl.src = href;
        sourceEl.type = mime;

        mediaEl.controls = true;
        mediaEl.appendChild(sourceEl);
      }

      element.setAttribute('type', mime);
      element.after(mediaEl);
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

import { EmbeddedLinksContent } from '../../../types';
import {
  EmbeddedLinksPosition,
  EMBEDDED_NOTE_TOKEN_EL,
  GET_DATA_CMD,
  GET_EMBEDDED_LINKS_CMD,
  GET_EMBEDDED_CONTENT_CMD,
  GET_GLOBAL_VALUE_CMD,
  GET_SETTING_CMD,
  MARKDOWNIT_SCRIPT_ID,
} from '../../../constants';

declare const webviewApi: any;

export class EmbeddedNotes {
  readonly contentId = 'rendered-md';
  readonly headerId = 'embedded-notes-header';

  findHeaderByName(name: string, el: Element): Element | null {
    if (!el || !name || !name.trim()) return null;
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

  async fetchEmbeddedContent(): Promise<Object> {
    return await webviewApi.postMessage(MARKDOWNIT_SCRIPT_ID, {
      command: GET_EMBEDDED_CONTENT_CMD,
    });
  }

  async fetchEmbeddedLinks(isFound: boolean): Promise<EmbeddedLinksContent> {
    return await webviewApi.postMessage(MARKDOWNIT_SCRIPT_ID, {
      command: GET_EMBEDDED_LINKS_CMD,
      isFound,
    });
  }

  async writeEmbeddedContent(): Promise<void> {
    const content = document.getElementById(this.contentId);
    if (!content) return;

    const embeds = await this.fetchEmbeddedContent();
    if (!embeds) return;

    for (const [token, html] of Object.entries(embeds)) {
      const placeholders = Array.from(content.querySelectorAll('.' + EMBEDDED_NOTE_TOKEN_EL)).filter(
        el => el.getAttribute('data-token') === token
      );
      if (!placeholders.length) continue;
      for (const placeholder of placeholders) {
        placeholder.outerHTML = html;
      }
    }
  }

  async writeEmbeddedLinks(): Promise<void> {
    const content = document.getElementById(this.contentId);
    if (!content) return;

    const name = (await this.fetchSetting<string>('listHeader')).replace(/^#{1,6}\s+/gm, '');
    const header = document.getElementById(this.headerId) ?? this.findHeaderByName(name, content);

    const embeddings = await this.fetchEmbeddedLinks(Boolean(header));
    if (embeddings.hide) return;

    this.insertEmbeddedLinks(content, header, embeddings);
  }

  insertEmbeddedLinks(content: Element, heading: Element | null, backlinks: EmbeddedLinksContent): void {
    const { head = '', body = '', position = EmbeddedLinksPosition.None } = backlinks;

    if (heading) {
      heading.insertAdjacentHTML('afterend', body);
      return;
    }

    if (position === EmbeddedLinksPosition.None) return;

    const insert = position === EmbeddedLinksPosition.Header ? 'afterbegin' : 'beforeend';
    content.insertAdjacentHTML(insert, head + body);
  }

  async noteUpdateHandler(): Promise<void> {
    await this.writeEmbeddedContent();
    await this.writeEmbeddedLinks();
  }

  async init(): Promise<void> {
    setTimeout(() => {
      this.noteUpdateHandler();
      document.addEventListener('joplin-noteDidUpdate', () => this.noteUpdateHandler());
    }, 300);
  }
}

new EmbeddedNotes().init();

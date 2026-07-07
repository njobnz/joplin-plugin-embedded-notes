import { EmbeddedLinksContent } from '../../../types';
import {
  EmbeddedLinksPosition,
  EMBEDDED_NOTES_FENCE_EL,
  EMBEDDED_NOTES_TOKEN_EL,
  GET_DATA_CMD,
  GET_EMBEDDED_LINKS_CMD,
  GET_EMBEDDED_CONTENT_CMD,
  GET_GLOBAL_VALUE_CMD,
  GET_SETTING_CMD,
  RENDER_MARKUP_CMD,
  MARKDOWNIT_SCRIPT_ID,
} from '../../../constants';
import escapeRegExp from '../../../utils/escapeRegExp';

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

  async fetchRenderMarkup(text: string, options: object = {}): Promise<string> {
    return await webviewApi.postMessage(MARKDOWNIT_SCRIPT_ID, {
      command: RENDER_MARKUP_CMD,
      text,
      options,
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

    const fences = Array.from(content.querySelectorAll(`.${EMBEDDED_NOTES_FENCE_EL}`));
    for (const fence of fences) {
      const pre = fence.querySelector('.joplin-source');
      if (!pre) return;

      const body = Array.from(pre.childNodes)
        .filter(n => n.nodeType === Node.TEXT_NODE)
        .map(n => n.textContent)
        .join('');

      let text: string = body;
      for (const [_, embed] of Object.entries(embeds)) {
        text = text.replace(new RegExp(escapeRegExp(embed.info.token), 'g'), embed.text);
      }

      while (pre.nextSibling) {
        pre.nextSibling.remove();
      }

      pre.insertAdjacentHTML('afterend', '<pre class="hljs"><code>' + text + '</code></pre>');
    }

    for (const [name, embed] of Object.entries(embeds)) {
      const placeholders = Array.from(content.querySelectorAll(`.${EMBEDDED_NOTES_TOKEN_EL}`)).filter(
        el => el.getAttribute('data-token') === name
      );
      if (!placeholders.length) continue;
      for (const placeholder of placeholders) {
        placeholder.outerHTML = embed.html;
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

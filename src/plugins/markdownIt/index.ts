import { EmbeddableNote, TokenRenderers } from '../../types';
import { getEmbeddedLinksCmd } from '../../constants';
import { readEmbeddableNotes } from '../../modules/readEmbeddableNotes';
import { getSettings as settings } from '../../utils/getSettings';

let isRendering = false;

export default context => {
  return {
    plugin: (markdownIt, _options) => {
      const contentScriptId = context.contentScriptId;

      const renderProxy = (tokens, idx, options, env, self) =>
        self.renderToken(tokens, idx, options, env, self);

      /**
       * Processes tokens with optional replacement and Markdown rendering.
       *
       * @param {Function} renderer - The original renderer function.
       * @param {boolean} [replaceContent=true] - Replace token text content.
       * @param {boolean} [renderMarkdown=true] - Render replaced content as Markdown.
       * @returns {Function} Customized render function.
       */
      const renderEmbeddings = (renderer, renderMarkdown = true, replaceContent = true) =>
        function (tokens, idx, options, env, self) {
          const token = tokens[idx];
          if (settings().fenceOnly && token.tag !== 'code')
            return renderer(tokens, idx, options, env, self);

          const embeddings = readEmbeddableNotes();
          if (embeddings && replaceContent && !isRendering) {
            const content = token.content;
            const results = processTokens(token, embeddings);
            const markdown = results.markdown || (renderMarkdown && settings().renderMarkdown);
            if (markdown && !results.text && token.content !== content) {
              // Temporarily disable custom rules added by other Joplin plugins that render
              // content in the footer of the markdown viewer using markdownIt rules.
              //
              // When markdownIt.render* is called, all active rules from other plugins
              // are processed, causing footer content to be re-rendered each time.
              const disableRulers = [
                'embeddable_notes_list',
                'footnote_tail2', // https://github.com/ambrt/joplin-plugin-referencing-notes/blob/4469dd69ecb4eeed97bb270ebfa508448c2bbd2b/src/notesReferences.js#L43
                'reference_list', // https://github.com/joplin/plugin-bibtex/blob/bfb9e2098d55b8061c43380fd581f6dd8d621d4b/src/ui/bibliography-renderer/render-list-content-script.ts#L12
              ];

              try {
                isRendering = true; // Prevent recursion when calling markdownIt.render
                disableRulers.forEach(ruler => {
                  markdownIt.core.ruler.disable(ruler, true);
                });

                return results.inline
                  ? markdownIt.renderInline(token.content)
                  : markdownIt.render(token.content);
              } catch (error) {
                console.error('Error rendering markdown:', error, tokens);
              } finally {
                isRendering = false;
                disableRulers.forEach(ruler => {
                  markdownIt.core.ruler.enable(ruler, true);
                });
              }
            }
          }
          return renderer(tokens, idx, options, env, self);
        };

      const renderer = {
        text: markdownIt.renderer.rules.text || renderProxy,
        code_inline: markdownIt.renderer.rules.code_inline || renderProxy,
        code_block: markdownIt.renderer.rules.code_block || renderProxy,
        html_inline: markdownIt.renderer.rules.html_inline || renderProxy,
        html_block: markdownIt.renderer.rules.html_block || renderProxy,
        link_open: markdownIt.renderer.rules.link_open || renderProxy,
        image: markdownIt.renderer.rules.image || renderProxy,
        fence: markdownIt.renderer.rules.fence || renderProxy,
      };

      markdownIt.renderer.rules.text = renderEmbeddings(renderer.text);
      markdownIt.renderer.rules.code_inline = renderEmbeddings(renderer.code_inline, false);
      markdownIt.renderer.rules.code_block = renderEmbeddings(renderer.code_block, false);
      markdownIt.renderer.rules.html_inline = renderEmbeddings(renderer.html_inline);
      markdownIt.renderer.rules.html_block = renderEmbeddings(renderer.html_block);
      markdownIt.renderer.rules.link_open = (tokens, idx, options, env, self) => {
        const embeddings = readEmbeddableNotes();
        if (embeddings) {
          const token = tokens[0];
          token.attrSet('href', replaceTokens(decodeURI(token.attrGet('href')), embeddings));
          token.attrSet('title', replaceTokens(token.attrGet('title'), embeddings));
        }
        return renderer.link_open(tokens, idx, options, env, self);
      };
      markdownIt.renderer.rules.image = (tokens, idx, options, env, self) => {
        const embeddings = readEmbeddableNotes();
        if (embeddings) {
          const token = tokens[0];
          token.attrSet('src', replaceTokens(decodeURI(token.attrGet('src')), embeddings));
          token.attrSet('title', replaceTokens(token.attrGet('title'), embeddings));
          token.content = replaceTokens(token.content, embeddings);
          if (token.children && token.children[0])
            // updates alt attribute
            token.children[0].content = replaceTokens(token.content, embeddings);
        }
        return renderer.image(tokens, idx, options, env, self);
      };
      markdownIt.renderer.rules.fence = (tokens, idx, options, env, self) =>
        renderEmbeddings(
          renderer.fence,
          tokens[idx].tag !== 'code',
          settings().blockFence || tokens[idx].info.includes('embeddable')
        )(tokens, idx, options, env, self);
      markdownIt.renderer.rules['embeddable_notes_list'] = (_tokens, _idx, _options) => {
        if (!settings().embeddedLinks) return '';
        const script = `
          webviewApi.postMessage('${contentScriptId}', { command: '${getEmbeddedLinksCmd}' }).then(result => {
            if (result?.body === null || result.body === '') return;
            const element = document.getElementById('embeddable-notes-list');
            if (!element) return;
            element.outerHTML = result.head + result.body;
          });
          return false;
				`;
        return `<style id="embeddable-notes-list" onload="${script.replace(/\s+/g, ' ')}"></style>`;
      };
      markdownIt.core.ruler.push('embeddable_notes_list', state => {
        let token = new state.Token('embeddable_notes_list', '', 0);
        state.tokens.push(token);
      });
    },
  };
};

/**
 * Replaces all tokens in a text string with their corresponding note
 * text and determines the renderer to use.
 *
 * @param {any} token - The input MarketdownIt token
 * @param {Record<string, EmbeddableNote>} embeddings - A mapping of note titles and ids
 *                                                      to their note object.
 * @returns {any} The renderer settings.
 */
function processTokens(token: any, embeddings: Record<string, EmbeddableNote>): TokenRenderers {
  let result = {
    text: false,
    inline: false,
    markdown: false,
  };

  // Set renderer based on first found token
  let found: boolean = false;
  const updateRenderer = renderer => {
    if (found) return;
    found = true;
    result = renderer;
  };

  for (const [name, data] of Object.entries(embeddings)) {
    if (!token.content.includes(name)) continue;
    updateRenderer(data.info.renderer);
    token.content = token.content.split(name).join(data.note?.body || '');
  }

  return result;
}

/**
 * Replaces all tokens in a text string with their corresponding note text.
 *
 * @param {string} text - The input text.
 * @param {Record<string, EmbeddableNote>} embeddings - A mapping of note titles and ids
 *                                                      to their note object.
 * @returns {string} The replaced text.
 */
function replaceTokens(text: string, embeddings: Record<string, EmbeddableNote>): string {
  if (text)
    for (const [name, info] of Object.entries(embeddings))
      text = text.split(name).join(info.note?.body || '');
  return text;
}

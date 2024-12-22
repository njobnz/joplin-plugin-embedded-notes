import { EmbeddableNote, TokenRenderers } from '../../types';
import readEmbeddableNotes from '../../modules/readEmbeddableNotes';
import settings from '../../utils/readSettings';
import escape from '../../utils/escapeRegExp';

let isRendering = false;

export default (_context: any) => ({
  plugin: (markdownIt: any, _options: any) => {
    const renderProxy = (tokens, idx, options, env, self) => self.renderToken(tokens, idx, options, env, self);

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
        if (settings().fenceOnly && token.tag !== 'code') return renderer(tokens, idx, options, env, self);

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
              'footnote_tail2', // https://github.com/ambrt/joplin-plugin-referencing-notes/blob/4469dd69ecb4eeed97bb270ebfa508448c2bbd2b/src/notesReferences.js#L43
              'reference_list', // https://github.com/joplin/plugin-bibtex/blob/bfb9e2098d55b8061c43380fd581f6dd8d621d4b/src/ui/bibliography-renderer/render-list-content-script.ts#L12
            ];

            try {
              isRendering = true; // Prevent recursion when calling markdownIt.render
              disableRulers.forEach(ruler => {
                markdownIt.core.ruler.disable(ruler, true);
              });

              return results.inline ? markdownIt.renderInline(token.content) : markdownIt.render(token.content);
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
  },
  assets: () => [{ name: 'assets/index.js' }],
});

/**
 * Replaces all tokens in a text string with their corresponding note
 * text and determines the renderer to use.
 *
 * @param {any} token - The input MarketdownIt token
 * @param {Record<string, EmbeddableNote>} embeddings - A mapping of note titles and ids
 *                                                      to their note object.
 * @returns {TokenRenderers} The renderer settings.
 */
const processTokens = (token: any, embeddings: Record<string, EmbeddableNote>): TokenRenderers => {
  let result = {
    markdown: false,
    inline: false,
    text: false,
  };

  // Set renderer based on first found token
  let found: boolean = false;
  const updateRenderer = renderer => {
    if (found) return;
    if (JSON.stringify(result) !== JSON.stringify(renderer)) {
      result = renderer;
      found = true;
    }
  };

  token.content = replaceTokens(token.content, embeddings, updateRenderer);

  return result;
};

/**
 * Replaces all tokens in a text string with their corresponding note text.
 *
 * @param {string} text - The input text.
 * @param {Record<string, EmbeddableNote>} embeddings - A mapping of note titles and ids
 *                                                      to their note object.
 * @param {function} updateRenderer - A function to update the renderer settings.
 * @returns {string} The replaced text.
 */
const replaceTokens = (
  text: string,
  embeddings: Record<string, EmbeddableNote>,
  updateRenderer: Function = null
): string => {
  if (text) {
    // Replaces tokens in the order they appear in the string.
    // For ambiguous tokens, only the first one is replaced.
    const filter = Object.keys(embeddings).filter(token => text.includes(token));
    const sorted = filter.sort((a, b) => text.indexOf(a) - text.indexOf(b));
    sorted.forEach(item => {
      const embed = embeddings[item] ?? null;
      if (!embed) return;
      if (updateRenderer) updateRenderer(embed.info.renderer);
      text = text.replace(new RegExp(escape(item), 'g'), embed.note?.body || '');
    });
  }
  return text;
};

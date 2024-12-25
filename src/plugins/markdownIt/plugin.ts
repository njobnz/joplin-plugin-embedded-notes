import { MARKDOWNIT_RULERS } from '../../constants';
import readEmbeddableNotes from '../../modules/readEmbeddableNotes';
import replaceTokens from '../../utils/replaceTokens';
import setting from '../../utils/readSettings';

let isRendering = false;

export default _context => ({
  plugin: (md, _options) => {
    const renderProxy = (tokens, idx, options, env, self) => self.renderToken(tokens, idx, options, env, self);
    const renderFence = md.renderer.rules.fence || renderProxy;

    md.renderer.rules.fence = (tokens, idx, options, env, self) => {
      const token = tokens[idx];

      if (setting<boolean>('fenceOnly') && token.type === 'fence' && !isRendering) {
        const embeddings = readEmbeddableNotes();
        const isEmbedded = embeddings && token.info.includes('embedded');
        const isMarkdown = isEmbedded && token.info.includes('markdown');

        if (isEmbedded) {
          const content = token.content;
          token.content = replaceTokens(token.content, embeddings);

          let html = '';
          if (isMarkdown) {
            try {
              // Temporarily disable custom rules added by other Joplin plugins that render
              // content in the footer of the markdown viewer using markdownIt rules.
              //
              // When markdownIt.render* is called, all active rules from other plugins
              // are processed, causing footer content to be re-rendered each time.
              MARKDOWNIT_RULERS.forEach(ruler => md.core.ruler.disable(ruler, true));

              // Prevent recursion when calling md.render
              isRendering = true;

              html = md.render(token.content);
            } catch (error) {
              console.error('Error rendering markdown:', error, tokens);
            } finally {
              // Ensure that the custom rules are re-enabled after rendering the embedded markdown.
              MARKDOWNIT_RULERS.forEach(ruler => md.core.ruler.enable(ruler, true));
              isRendering = false;
            }
          }

          if (!html) {
            html = renderFence(tokens, idx, options, env, self);

            // Joplin markdown highlighter wraps the content its own "joplin-editable" element.
            // Extract just the content block from the rendered HTML.
            // Code highlighting remains applied to the embedded note.
            const start = html.indexOf('</pre>') + 6;
            const end = html.lastIndexOf('</div>');

            html = html.slice(start, end);
          }

          return `
            <div class="joplin-editable embedded-note embedded-note-fence">
              <pre
                class="joplin-source"
                data-joplin-language="${md.utils.escapeHtml(token.info)}"
                data-joplin-source-open="${token.markup}${md.utils.escapeHtml(token.info)}&NewLine;"
                data-joplin-source-close="${token.markup}"
              >${md.utils.escapeHtml(content)}</pre>
              ${html}
            </div>
          `;
        }
      }

      return renderFence(tokens, idx, options, env, self);
    };

    md.core.ruler.before('normalize', 'embedded_notes', (state: any) => {
      if (!setting<boolean>('fenceOnly')) state.src = replaceTokens(state.src, readEmbeddableNotes());
    });
  },
  assets: () => [{ name: 'assets/index.js' }],
});

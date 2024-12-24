import { MARKDOWNIT_RULERS } from '../../constants';
import readEmbeddableNotes from '../../modules/readEmbeddableNotes';
import replaceTokens from '../../utils/replaceTokens';
import settings from '../../utils/readSettings';

let isRendering = false;

export default _context => ({
  plugin: (md, _options) => {
    const renderProxy = (tokens, idx, options, env, self) => self.renderToken(tokens, idx, options, env, self);
    const renderFence = md.renderer.rules.fence || renderProxy;

    md.renderer.rules.fence = (tokens, idx, options, env, self) => {
      const token = tokens[idx];

      if (settings().fenceOnly && token.tag === 'code' && !isRendering) {
        const embeddings = readEmbeddableNotes();
        const isEmbedded = embeddings && token.info.includes('embedded');
        const isMarkdown = token.info.includes('embedded+markdown');

        if (isEmbedded) {
          token.content = replaceTokens(token.content, embeddings);
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

              return md.render(token.content);
            } catch (error) {
              console.error('Error rendering markdown:', error, tokens);
            } finally {
              // Ensure that the custom rules are re-enabled after rendering the embedded markdown.
              MARKDOWNIT_RULERS.forEach(ruler => md.core.ruler.enable(ruler, true));
              isRendering = false;
            }
          }
        }
      }

      return renderFence(tokens, idx, options, env, self);
    };

    md.core.ruler.before('normalize', 'embedded_notes', (state: any) => {
      if (!settings().fenceOnly) state.src = replaceTokens(state.src, readEmbeddableNotes());
    });
  },
  assets: () => [{ name: 'assets/index.js' }],
});

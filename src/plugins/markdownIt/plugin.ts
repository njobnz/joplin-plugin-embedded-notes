import readEmbeddableNotes from '../../modules/readEmbeddableNotes';
import replaceTokens from '../../utils/replaceTokens';
import settings from '../../utils/readSettings';

export default (_context: any) => ({
  plugin: (markdownIt: any, _options: any) => {
    const renderProxy = (tokens, idx, options, env, self) => self.renderToken(tokens, idx, options, env, self);

    const renderer = {
      fence: markdownIt.renderer.rules.fence || renderProxy,
    };

    const renderEmbeddings = (renderer: any, replace: boolean = true) =>
      function (tokens, idx, options, env, self) {
        const token = tokens[idx];

        if (settings().fenceOnly && token.tag === 'code') {
          const embeddings = readEmbeddableNotes();
          if (embeddings && replace) {
            token.content = replaceTokens(token.content, embeddings);
          }
        }

        return renderer(tokens, idx, options, env, self);
      };

    markdownIt.renderer.rules.fence = (tokens, idx, options, env, self) =>
      renderEmbeddings(renderer.fence, tokens[idx].info.includes('embedded'))(tokens, idx, options, env, self);

    markdownIt.core.ruler.before('normalize', 'embedded_notes', (state: any) => {
      if (settings().fenceOnly) return;
      state.src = replaceTokens(state.src, readEmbeddableNotes());
    });
  },
  assets: () => [{ name: 'assets/index.js' }],
});

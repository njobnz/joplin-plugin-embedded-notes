import { EMBEDDED_BLOCK_HEADER, EMBEDDED_BLOCK_MARKDOWN, MARKDOWNIT_RULERS } from '../../constants';
import readEmbeddableNotes from '../../modules/readEmbeddableNotes';
import replaceTokens from '../../utils/replaceTokens';

let isRendering = false;

export default _context => ({
  plugin: (md, _options) => {
    const renderProxy = (tokens, idx, options, env, self) => self.renderToken(tokens, idx, options, env, self);
    const renderFence = md.renderer.rules.fence || renderProxy;

    md.renderer.rules.fence = (tokens, idx, options, env, self) => {
      const token = tokens[idx];

      if (_options.settingValue('fenceOnly') && !isRendering) {
        const embeddings = readEmbeddableNotes(_options.noteId);
        const isEmbedded = embeddings && token.info.includes(EMBEDDED_BLOCK_HEADER);
        const isMarkdown = isEmbedded && token.info.includes(EMBEDDED_BLOCK_MARKDOWN);

        if (isEmbedded) {
          const content = token.content;
          token.content = replaceTokens(_options.noteId, content, embeddings, _options.resourceBaseUrl);

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
            const text = renderFence(tokens, idx, options, env, self);

            // Joplin markdown highlighter wraps the content its own "joplin-editable" element.
            // Extract just the content block from the rendered HTML.
            // Code highlighting remains applied to the embedded note.
            const parser = new DOMParser();
            const doc = parser.parseFromString(text, 'text/html');
            const div = doc.querySelector('.joplin-editable');
            doc.querySelectorAll('.joplin-source').forEach(el => el.remove());
            html = div ? div.innerHTML : text;
          }

          return `
            <div class="joplin-editable embedded-notes-fence">
              <pre
                class="joplin-source"
                data-joplin-language="${md.utils.escapeHtml(token.info.split(' ').join('+'))}"
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
      if (_options.settingValue('fenceOnly')) return;

      state.src = replaceTokens(
        _options.noteId,
        state.src,
        readEmbeddableNotes(_options.noteId),
        _options.settingValue('showResources') ? _options.resourceBaseUrl : null
      );
    });
  },
  assets: () => [{ name: 'assets/index.js' }],
});

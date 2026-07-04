import { EMBEDDED_BLOCK_HEADER, EMBEDDED_BLOCK_MARKDOWN, EMBEDDED_NOTES_FENCE_EL } from '../../constants';
import applyPlaceholders from '../../utils/applyPlaceholders';

export default (_context: any) => ({
  plugin: (md: any, _options: any) => {
    const renderProxy = (tokens: any, idx: any, options: any, env: any, self: any) =>
      self.renderToken(tokens, idx, options, env, self);
    const renderFence = md.renderer.rules.fence || renderProxy;

    md.renderer.rules.fence = (tokens: any, idx: any, options: any, env: any, self: any) => {
      const token = tokens[idx];

      const isEmbedded = token.info.includes(EMBEDDED_BLOCK_HEADER);
      const isMarkdown = token.info.includes(EMBEDDED_BLOCK_MARKDOWN);

      if (isEmbedded) {
        const content = token.content;

        if (isMarkdown) {
          return applyPlaceholders(content, _options.settingValue('prefix'), _options.settingValue('suffix'));
        }

        const text = renderFence(tokens, idx, options, env, self);

        // Joplin markdown highlighter wraps the content its own "joplin-editable" element.
        // Extract just the content block from the rendered HTML.
        // Code highlighting remains applied to the embedded note.
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');
        const div = doc.querySelector('.joplin-editable');
        doc.querySelectorAll('.joplin-source').forEach(el => el.remove());

        const html = div ? div.innerHTML : text;

        return `
          <div class="joplin-editable ${EMBEDDED_NOTES_FENCE_EL}">
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

      return renderFence(tokens, idx, options, env, self);
    };

    md.core.ruler.before('normalize', 'embedded_notes', (state: any) => {
      if (_options.settingValue('fenceOnly')) return;
      state.src = applyPlaceholders(state.src, _options.settingValue('prefix'), _options.settingValue('suffix'));
    });
  },
  assets: () => [{ name: 'assets/index.js' }],
});

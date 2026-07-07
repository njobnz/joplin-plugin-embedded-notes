import { EMBEDDED_BLOCK_HEADER, EMBEDDED_BLOCK_MARKDOWN, EMBEDDED_NOTES_FENCE_EL } from '../../constants';
import applyPlaceholders from '../../utils/applyPlaceholders';

export default (_context: any) => ({
  plugin: (md: any, _options: any) => {
    const renderProxy = (tokens: any, idx: any, options: any, env: any, self: any) =>
      self.renderToken(tokens, idx, options, env, self);
    const renderFence = md.renderer.rules.fence || renderProxy;

    let disabled: boolean = false;

    md.core.ruler.before('normalize', 'embedded_notes', (state: any) => {
      const text = _options.settingValue('disableText');
      if (text) disabled = state.src.includes(text);
      if (disabled || _options.settingValue('fenceOnly')) return;
      state.src = renderPlaceholders(state.src);
    });

    md.renderer.rules.fence = (tokens: any, idx: any, options: any, env: any, self: any) => {
      const token = tokens[idx];
      const html = renderFence(tokens, idx, options, env, self);

      if (disabled || !token.info.includes(EMBEDDED_BLOCK_HEADER)) {
        return html;
      }

      if (token.info.includes(EMBEDDED_BLOCK_MARKDOWN)) {
        return renderPlaceholders(token.content);
      }

      const doc = new DOMParser().parseFromString(html, 'text/html');
      const div = doc.querySelector('.joplin-editable');

      doc.querySelectorAll('.joplin-source').forEach(el => el.remove());

      const list = div ? div.classList.toString() : 'joplin-editable';
      const text = div ? div.innerHTML : html;

      return `
        <div class="${list} ${EMBEDDED_NOTES_FENCE_EL}">
          <pre
            class="joplin-source"
            data-joplin-language="${md.utils.escapeHtml(token.info)}"
            data-joplin-source-open="${token.markup}${md.utils.escapeHtml(token.info)}&NewLine;"
            data-joplin-source-close="${token.markup}"
          >${md.utils.escapeHtml(token.content)}</pre>
          ${text}
        </div>
      `;
    };

    const renderPlaceholders = (text: string): string => {
      return applyPlaceholders(text, _options.settingValue('prefix'), _options.settingValue('suffix'));
    };
  },
  assets: () => [{ name: 'assets/index.js' }],
});

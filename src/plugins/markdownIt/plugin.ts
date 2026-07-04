import applyTokenPlaceholders from '../../utils/applyTokenPlaceholders';

export default (_context: any) => ({
  plugin: (md: any, _options: any) => {
    const renderProxy = (tokens: any, idx: any, options: any, env: any, self: any) =>
      self.renderToken(tokens, idx, options, env, self);
    const renderFence = md.renderer.rules.fence || renderProxy;

    md.renderer.rules.fence = (tokens: any, idx: any, options: any, env: any, self: any) => {
      return renderFence(tokens, idx, options, env, self);
    };

    md.core.ruler.before('normalize', 'embedded_notes', (state: any) => {
      if (_options.settingValue('fenceOnly')) return;
      state.src = applyTokenPlaceholders(state.src, _options.settingValue('prefix'), _options.settingValue('suffix'));
    });
  },
  assets: () => [{ name: 'assets/index.js' }],
});

import { TokenInfo, TokenRenderers } from '../types';
import escape from './escapeRegExp';

/**
 * Parses a token and extracts its properties and modifiers,
 * including name and optional renderer modifier.
 *
 * @param {string} input - The input token.
 * @param {string} prefix - The token opening tag.
 * @param {string} suffix - The token closing tag.
 * @param {string[]} renderers - Array of renderer tags.
 * @throws {Error} If the prefix or suffix is missing or invalid.
 * @returns {Object} An object containing the token name and renderer type.
 */
export default (input: string, prefix: string, suffix: string, renderers: string[]): TokenInfo => {
  if (!prefix || !suffix) throw new Error('Token prefix or suffix cannot be empty.');
  if (!renderers && renderers.length !== 6) throw new Error('Invalid renderers list supplied.');

  enum Renderer {
    Markdown,
    Inline,
    Text,
  }

  const r = renderers;
  const patterns = [
    { regex: new RegExp(`^${escape(r[0])}(.*)${escape(r[1])}$`), renderer: Renderer.Markdown },
    { regex: new RegExp(`^${escape(r[2])}(.*)${escape(r[3])}$`), renderer: Renderer.Inline },
    { regex: new RegExp(`^${escape(r[4])}(.*)${escape(r[5])}$`), renderer: Renderer.Text },
  ];

  const rendererConfig = (renderer: Renderer = null): TokenRenderers => {
    return {
      markdown: renderer === Renderer.Markdown || renderer === Renderer.Inline,
      inline: renderer === Renderer.Inline,
      text: renderer === Renderer.Text,
    };
  };

  const token = `${prefix}${input}${suffix}`;
  const matches = patterns.find(({ regex }) => regex.test(input));
  const name = matches ? input.match(matches.regex)[1] : input;
  const renderer = rendererConfig(matches?.renderer);

  return { name, tag: input, token, renderer };
};

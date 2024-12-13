import { TokenInfo, TokenRenderers } from '../types';
import { escapeRegEx as escape } from '../utilities';
import { getSettings as settings } from './getSettings';

/**
 * Parses a token and extracts its properties and modifiers,
 * including name and optional renderer modifier.
 *
 * @param {string} tag - The input token.
 * @throws {Error} If the prefix or suffix is missing or invalid.
 * @returns {Object} An object containing the token name and renderer type.
 */
export const parseToken = (tag): TokenInfo => {
  const { prefix, suffix, rendererTags: r } = settings();
  if (!prefix || !suffix) throw new Error('Token prefix or suffix cannot be empty.');

  enum Renderer {
    Markdown,
    Inline,
    Text,
  }

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

  const token = `${prefix}${tag}${suffix}`;
  const matches = patterns.find(({ regex }) => regex.test(tag));
  const name = matches ? tag.match(matches.regex)[1] : tag;
  const renderer = rendererConfig(matches?.renderer);

  return { name, tag, token, renderer };
};

import { parseTokens } from '../src/utils/parseTokens';

describe('Extract valid tokens from an input string', () => {
  const testTags = [
    { p: '%%', s: '%%', a: '(', b: ')', c: '[', d: ']', e: '{', f: '}' },
    { p: '{{', s: '}}', a: '(', b: ')', c: '[', d: ']', e: '/', f: '/' },
  ];

  testTags.forEach(({ p, s, a, b, c, d, e, f }, i) => {
    const testText = [
      {
        input: `baz${p}foo${s} bar${p[0]}${p}${e}baz foo${f}${s}${s[0]}${p}${p}b${p[0]}r f${s[0]}o${s}foo${s}`,
        expected: [`foo`, `${e}baz foo${f}`, `b${p[0]}r f${s[0]}o`],
      },
      {
        input: `${p}${a}a${b}${s} ${p}${c}b${d}${s} ${p}${e}c${f}${s} ${p}${e}${e}d${f}${f}${s}`,
        expected: [`${a}a${b}`, `${c}b${d}`, `${e}c${f}`, `${e}${e}d${f}${f}`],
      },
      {
        input: `${p} foo${s} bar${p} baz foo ${s} bar ${p}baz ${s}`,
        expected: [],
      },
      {
        input: `${p}foo\rbar${s} ${p}foo\nbar${s} ${p}foo\r\nbar${s}`,
        expected: [],
      },
      {
        input: `test${p}${s}${p}foo${s} ${p}foo bar${s} ${p} ${s} ${p}  ${s}`,
        expected: ['foo', 'foo bar'],
      },
      {
        // Ambiguous token handling
        input: `${p}foo${p}foo bar${s}`,
        expected: p === s ? ['foo', 'foo bar'] : ['foo bar'],
      },
    ];

    testText.forEach(({ input, expected }, j) => {
      it(`should correctly extract valid tokens between '${p}' and '${s}' from test text ${
        j + 1
      }`, () => {
        const result = parseTokens(input, p, s);
        expect(result).toEqual(expected);
      });
    });
  });
});

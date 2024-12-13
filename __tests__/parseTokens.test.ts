import { parseTokens } from '../src/utils/parseTokens';

describe('Extract valid tokens from an input string', () => {
  const testTags = [
    { p: '%%', s: '%%', a: '(', b: ')', c: '[', d: ']', e: '{', f: '}' },
    { p: '{{', s: '}}', a: '(', b: ')', c: '[', d: ']', e: '/', f: '/' },
  ];

  testTags.forEach(async ({ p, s, a, b, c, d, e, f }, i) => {
    const testText = [
      {
        input: `baz${p}foo${s} bar${p}${p}baz foo${s}bar${s} ${p}foo ${p}bar baz${s} foo${s}`,
        expected: [`foo`, `baz foo`, `bar baz`],
      },
      {
        input: `${p}a${s}bar${p}b${s}${p}foo${s}${p}foo bar${s}baz${s}`,
        expected: [`a`, `b`, `foo`, `foo bar`],
      },
      {
        input: `${p}${a}a${b}${s} ${p}${c}b${d}${s} ${p}${e}c${f}${s}`,
        expected: [`${a}a${b}`, `${c}b${d}`, `${e}c${f}`],
      },
      {
        input: `${p}foo${s[0]}bar${s} ${p}foo${p[0]}bar${s} ${p} foo${s} ${p}bar ${s}`,
        expected: [],
      },
      {
        input: `${p}foo\rbar${s} ${p}foo\nbar${s} ${p}foo\r\nbar${s}`,
        expected: [],
      },
      {
        input: `${p}${s} ${p} ${s} ${p}  ${s}`,
        expected: [],
      },
    ];

    testText.forEach(async ({ input, expected }, j) => {
      it(`should correctly extract valid tokens between '${p}' and '${s}' from test text ${
        j + 1
      }`, async () => {
        const result = await parseTokens(input, p, s);
        expect(result).toEqual(expected);
      });
    });
  });
});

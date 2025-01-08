import getEmbeddableFencedContent from '../src/modules/getEmbeddableFencedContent';

describe('Extract content from all valid markdown fenced code blocks with embedded in the header', () => {
  it('should return content within all valid fenced code blocks', () => {
    const markdown = `
Outside fenced code blocks

%^OutsideToken1^%

\`\`\`embedded
Inside fenced code block

%^ValidToken1^%
\`\`\`

%^OutsideToken2^%

   \`\`\`\`embedded
\`\`\`embedded
Nested fenced code block

%^ValidToken2^%

%^ValidToken3^%
\`\`\`
\`\`\`\`

   \`\`\`
%^InvalidToken1^%
\`\`\`

   \`\`\`javascript
\`\`\`embedded
%^InvalidToken2^%
\`\`\`

\`\`\`embedded\`
%^InvalidToken3^%
    \`\`\`embedded
%^InvalidToken4^%
   \`\`\`embedded
%^ValidToken4^%
 \`\`\`

 \`\`\`embedded
Block without closing tag

%^ValidToken5^%
`;

    const expected = `
Inside fenced code block

%^ValidToken1^%

\`\`\`embedded
Nested fenced code block

%^ValidToken2^%

%^ValidToken3^%
\`\`\`

%^ValidToken4^%

Block without closing tag

%^ValidToken5^%
`;

    expect(getEmbeddableFencedContent(markdown)).toBe(expected);
  });
});

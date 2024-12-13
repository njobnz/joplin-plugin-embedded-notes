import { ContentScriptContext } from 'api/types';
import type * as CodeMirrorAutocompleteType from '@codemirror/autocomplete';
import type { CompletionContext, CompletionResult, Completion } from '@codemirror/autocomplete';
import type { EditorView } from '@codemirror/view';
import type { Extension } from '@codemirror/state';
import { getFilteredTokensCmd } from '../../constants';
import { escapeRegEx as escape } from '../../utilities';
import { getSettings as settings } from '../../utils/getSettings';

export default async (CodeMirror: any, _context: ContentScriptContext) => {
  const { autocompletion, insertCompletionText } =
    require('@codemirror/autocomplete') as typeof CodeMirrorAutocompleteType;

  const completeToken = async (context: CompletionContext): Promise<CompletionResult> => {
    const { prefix, suffix, idOnly, autocomplete, rendererTags: r } = settings();

    if (!autocomplete) return null;

    const pattern = new RegExp(`${escape(prefix)}[^]*`);
    const match = context.matchBefore(pattern);

    if (!match || (match.from === match.to && !context.explicit)) return null;

    const brackets = new Map<string, string>();

    brackets.set(r[0], r[1]);
    brackets.set(r[2], r[3]);
    brackets.set(r[4], r[5]);

    const first = match.text[prefix.length];
    const opening = new RegExp(`^[${escape(r[0] + r[2] + r[4])}]`).test(first) ? first : '';
    const closing = brackets[opening] ?? '';

    const tokens = await _context.postMessage({
      command: getFilteredTokensCmd,
      query: {
        prefix: match.text.substring(prefix.length + (opening ? 1 : 0)),
      },
    });

    if (!tokens && tokens.length) return null;

    const createApplyCompletionFn = (noteTitle: string, noteId: string) => {
      return (view: EditorView, _completion: Completion, from: number, to: number) => {
        // TODO: Add custom keybind to insert note id from autocomplete dropdown
        const tokenName = idOnly ? noteId : noteTitle;
        const tokenText = `${prefix}${opening}${tokenName}${closing}${suffix}`;
        view.dispatch(insertCompletionText(view.state, tokenText, from, to));
      };
    };

    const completions: Completion[] = [];
    for (const note of tokens) {
      completions.push({
        apply: createApplyCompletionFn(note.title, note.id),
        label: note.title,
        detail: `(${note.id})`,
      });
    }

    return {
      from: match.from,
      options: completions,
      filter: false,
    };
  };

  const extension: Extension = CodeMirror.joplinExtensions
    ? CodeMirror.joplinExtensions.completionSource(completeToken)
    : autocompletion({ override: [completeToken] });

  CodeMirror.addExtension([
    extension,
    autocompletion({ tooltipClass: () => 'embedded-notes-autocompletion' }),
  ]);
};

import { ContentScriptContext } from 'api/types';
import type * as CodeMirrorAutocompleteType from '@codemirror/autocomplete';
import type { CompletionContext, CompletionResult, Completion } from '@codemirror/autocomplete';
import type { EditorView } from '@codemirror/view';
import type { Extension } from '@codemirror/state';
import { GET_FILTERED_TOKENS_CMD, GET_SETTINGS_CMD } from '../../constants';
import escape from '../../utils/escapeRegExp';

export default async (CodeMirror: any, _context: ContentScriptContext) => {
  const { autocompletion, insertCompletionText } =
    require('@codemirror/autocomplete') as typeof CodeMirrorAutocompleteType;

  const completeToken = async (context: CompletionContext): Promise<CompletionResult> => {
    const { prefix, suffix, idOnly, autocomplete } = await _context.postMessage({
      command: GET_SETTINGS_CMD,
      values: ['prefix', 'suffix', 'idOnly', 'autocomplete'],
    });

    if (!autocomplete) return null;

    const pattern = new RegExp(`${escape(prefix)}[^${escape(prefix)}]*`);
    const match = context.matchBefore(pattern);

    if (!match || (match.from === match.to && !context.explicit)) return null;

    const tokens = await _context.postMessage({
      command: GET_FILTERED_TOKENS_CMD,
      query: {
        prefix: match.text.substring(prefix.length),
      },
    });

    if (!tokens && tokens.length) return null;

    const createApplyCompletionFn = (noteTitle: string, noteId: string) => {
      return (view: EditorView, _completion: Completion, from: number, to: number) => {
        // TODO: Add custom keybind to insert note id from autocomplete dropdown
        const tokenName = idOnly ? noteId : noteTitle;
        const tokenText = `${prefix}${tokenName}${suffix}`;
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

  CodeMirror.addExtension([extension, autocompletion({ tooltipClass: () => 'embedded-notes-autocompletion' })]);
};

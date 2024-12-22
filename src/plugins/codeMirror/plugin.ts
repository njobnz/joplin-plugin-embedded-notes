import { ContentScriptContext } from 'api/types';
import CodeMirror6 from './codeMirror6';

export default (context: ContentScriptContext) => {
  return {
    plugin: (CodeMirror: any) =>
      //CodeMirror.cm6 ? CodeMirror5(CodeMirror, context) : CodeMirror6(CodeMirror, context),
      CodeMirror6(CodeMirror, context),
    codeMirrorResources: ['addon/hint/show-hint'],
    codeMirrorOptions: {
      quickTokens: true,
    },
    assets: () => [{ name: 'assets/hints.css' }],
  };
};

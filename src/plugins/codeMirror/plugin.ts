import { ContentScriptContext } from 'api/types';
import CodeMirror6 from './codeMirror6';

export default (context: ContentScriptContext) => {
  return {
    //plugin: (CodeMirror: any) => (CodeMirror.cm6 ? CodeMirror6(CodeMirror, context) : CodeMirror5(CodeMirror, context)),
    plugin: (CodeMirror: any) => (CodeMirror.cm6 ? CodeMirror6(CodeMirror, context) : null),
    codeMirrorResources: ['addon/hint/show-hint'],
    assets: () => [{ name: 'assets/hints.css' }],
  };
};

interface AppLocalization {
  settings__appName: string;
  settings__description: string;

  setting__autocomplete: string;
  setting__autocomplete__description: string;
  setting__fenceOnly: string;
  setting__fenceOnly__description: string;
  setting__idOnly: string;
  setting__idOnly__description: string;
  setting__tag: string;
  setting__tag__description: string;
  setting__prefix: string;
  setting__prefix__description: string;
  setting__suffix: string;
  setting__suffix__description: string;

  setting__listPosition: string;
  setting__listPosition__description: string;
  setting__listType: string;
  setting__listType__description: string;
  setting__showIcon: string;
  setting__showIcon__description: string;
  setting__showPanel: string;
  setting__showPanel__description: string;

  setting__blockFence: string;
  setting__blockFence__description: string;
  setting__renderMarkdown: string;
  setting__renderMarkdown__description: string;
  setting__rendererTags: string;
  setting__rendererTags__description: string;

  setting__listHeader: string;
  setting__listHeader__description: string;
  setting__listDelimiter: string;
  setting__listDelimiter__description: string;
  setting__customCss: string;
  setting__customCss__description: string;

  message__reloadPanel: string;
}

const defaultStrings: AppLocalization = {
  settings__appName: 'Embedded Notes',
  settings__description: 'Reference content from other notes using placeholder tokens.',

  setting__autocomplete: 'Autocomplete',
  setting__autocomplete__description:
    'Display a dropdown of token suggestions in the editor when the opening tag is entered.',
  setting__fenceOnly: 'Code blocks only',
  setting__fenceOnly__description: 'Only replace tokens found in fenced code blocks (```).',
  setting__idOnly: 'Note IDs only',
  setting__idOnly__description: 'Allow only note IDs to be used as tokens.',
  setting__tag: 'Tag filter',
  setting__tag__description:
    'Restrict token titles to notes with the specified tag name. Notes without this tag can still be referenced by ID.',
  setting__prefix: 'Token prefix',
  setting__prefix__description: 'Opening tag for tokens. (default: %%)',
  setting__suffix: 'Token suffix',
  setting__suffix__description: 'Closing tag for tokens. (default: %%)',

  setting__listPosition: 'Embedded links',
  setting__listPosition__description:
    'Position to render a list of embedded note titles with links to the original notes in the markdown viewer.',
  setting__listType: 'List style',
  setting__listType__description: 'Display embedded links as new lines, ordered, or unordered list.',
  setting__showPanel: 'Display panel',
  setting__showPanel__description: 'Display embedded links in a separate panel.',
  setting__showIcon: 'Joplin icon',
  setting__showIcon__description: 'Display Joplin link icon next to embedded links.',

  setting__listHeader: 'List header',
  setting__listHeader__description: 'Text to display as the header of the embedded links footer block.',
  setting__listDelimiter: 'List delimiter',
  setting__listDelimiter__description:
    'Define a custom delimiter to seperate embedded links when the "New Line" list style is selected. (Default: \\n)',
  setting__customCss: 'Panel stylesheet',
  setting__customCss__description: 'Path to custom CSS for styling the embedded links panel.',

  setting__blockFence: 'Always replace in code blocks',
  setting__blockFence__description:
    'Automatically replace tokens in fenced code blocks (```). To enable token replacement for a specific block, write `embedded` in the header.',
  setting__renderMarkdown: 'Always render markdown (caution)',
  setting__renderMarkdown__description:
    'Always render markdown found in referenced notes without using ( ) tags. Markdown is not rendered in code blocks. This feature is highly experimental and may cause rendering issues.',
  setting__rendererTags: 'Renderer tags',
  setting__rendererTags__description:
    'Customize the characters used for renderer tags. Change only if the default tags conflict with custom token tags. Enter a space-separated list of single-character tags in this order: markdown (open/close), inline markdown (open/close), and plain text (open/close). (default: ( ) [ ] { })',

  message__reloadPanel: '# Embeddings\n\nSelect a note to load this panel.',
};

const localizations: Record<string, AppLocalization> = {
  en: defaultStrings,

  es: {
    ...defaultStrings,
  },
};

let localization: AppLocalization | undefined;

const languages = [...navigator.languages];
for (const language of navigator.languages) {
  const localeSep = language.indexOf('-');

  if (localeSep !== -1) {
    languages.push(language.substring(0, localeSep));
  }
}

for (const locale of languages) {
  if (locale in localizations) {
    localization = localizations[locale];
    break;
  }
}

if (!localization) {
  console.log('No supported localization found. Falling back to default.');
  localization = defaultStrings;
}

export default localization!;

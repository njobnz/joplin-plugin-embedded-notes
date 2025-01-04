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
  setting__showPanel: string;
  setting__showPanel__description: string;
  setting__showIcon: string;
  setting__showIcon__description: string;

  setting__showResources: string;
  setting__showResources__description: string;
  setting__newNoteTitle: string;
  setting__newNoteTitle__description: string;

  setting__listHeader: string;
  setting__listHeader__description: string;
  setting__listDelimiter: string;
  setting__listDelimiter__description: string;
  setting__customCss: string;
  setting__customCss__description: string;

  setting__disableText: string;
  setting__disableText__description: string;

  command_toggleEmbeddingsPanel: string;
  command_createNoteWithEmbeddedContent: string;

  message__reloadPanel: string;
  message__tokensDisabled: string;
}

const defaultStrings: AppLocalization = {
  settings__appName: 'Embedded Notes',
  settings__description: 'Reference content from other notes using placeholder tokens.',

  setting__autocomplete: 'Enable autocomplete',
  setting__autocomplete__description:
    'Display a dropdown of token suggestions in the editor when the opening tag is entered.',
  setting__fenceOnly: 'Code blocks only',
  setting__fenceOnly__description:
    'Restrict token replacement to fenced code blocks (```) that include `embedded` in the header.',
  setting__idOnly: 'Note IDs only',
  setting__idOnly__description: 'Allow only note IDs to be used as tokens.',
  setting__tag: 'Tag filter',
  setting__tag__description:
    'Restrict token titles to notes with the specified tag name. Notes without this tag can still be referenced by ID.',
  setting__prefix: 'Token prefix',
  setting__prefix__description: 'Opening tag for tokens. (default: %^)',
  setting__suffix: 'Token suffix',
  setting__suffix__description: 'Closing tag for tokens. (default: ^%)',

  setting__listPosition: 'Embedded links',
  setting__listPosition__description: 'Position to display the list of embedded note links in the markdown viewer.',
  setting__listType: 'List style',
  setting__listType__description: 'Display embedded links as new lines, ordered, or unordered list.',
  setting__showPanel: 'Display panel',
  setting__showPanel__description: 'Display embedded links in a separate panel.',
  setting__showIcon: 'Joplin icon',
  setting__showIcon__description: 'Display Joplin link icon next to embedded links.',

  setting__showResources: 'Show resources',
  setting__showResources__description:
    'Render embedded resources in referenced content. This setting is experimental and may cause issues.',
  setting__newNoteTitle: 'Embedded title',
  setting__newNoteTitle__description: 'Text to appened to note titles when creating a new note with embedded content.',

  setting__listHeader: 'List header',
  setting__listHeader__description: 'Header text for the embedded links section. (default: Embeddings)',
  setting__listDelimiter: 'List delimiter',
  setting__listDelimiter__description:
    'Defines a custom delimiter to separate embedded links when the "New Line" list style is selected. (Default: \\n)',
  setting__customCss: 'Panel stylesheet',
  setting__customCss__description: 'Path to custom CSS for styling the embedded links panel.',

  setting__disableText: 'Disable text',
  setting__disableText__description:
    'Use this text to prevent token replacement in a note. (default: <!-- embedded-notes-disable -->)',

  command_toggleEmbeddingsPanel: 'Show/hide embedded links panel',
  command_createNoteWithEmbeddedContent: 'Create a new note with embedded content',

  message__reloadPanel: '# Embedded Notes\n\nSelect a note to load this panel.',
  message__tokensDisabled: '*Token replacement disabled.*',
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

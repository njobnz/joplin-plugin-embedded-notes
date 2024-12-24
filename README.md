# Embedded Notes for Joplin

[![Latest Release](https://img.shields.io/github/v/release/njobnz/joplin-plugin-embedded-notes?logo=joplin&label=plugin&color=1071D3)](https://github.com/njobnz/joplin-plugin-embedded-notes/releases/latest)
[![Build and Test](https://img.shields.io/github/actions/workflow/status/njobnz/joplin-plugin-embedded-notes/test.yml)](https://github.com/njobnz/joplin-plugin-embedded-notes/actions/workflows/test.yml)
[![MIT License](https://img.shields.io/github/license/njobnz/joplin-plugin-embedded-notes)](https://opensource.org/licenses/MIT)

A plugin for Joplin that enables referencing content from other notes using placeholder tokens.

## Usage

### Referencing Notes

To reference the content of another note, use the following syntax:

```
%%Title of Another Note%%
```

This will display the content of the note titled "**Title of Another Note**" in the markdown viewer.

Alternatively, reference a note using its ID:

```
%%4a7fbc2e5d9a36e10cf8b4d7ea12c390%%
```

### Autocomplete

Typing the opening tag (%%) triggers a dropdown menu listing available note titles. Selecting a title will autocomplete the token.

## Settings

| Setting          | Default      | Description                                                                                                                                           |
| ---------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Autocomplete     | Yes          | Display a dropdown of token suggestions in the editor when the opening tag is entered.                                                                |
| Code blocks only | No           | Only replace tokens found in fenced code blocks (\`\`\`). To enable token replacement for a specific block, write `embedded` in the header. (\`\`\`). |
| Note IDs only    | No           | Allow only note IDs to be used as tokens.                                                                                                             |
| Tag filter       |              | Restrict token titles to notes with the specified tag name. Notes without this tag can still be referenced by ID.                                     |
| Token prefix     | %%           | Opening tag for tokens. (default: %%)                                                                                                                 |
| Token suffix     | %%           | Closing tag for tokens. (default: %%)                                                                                                                 |
| Embedded links   | Note Footer  | Position to render a list of embedded note titles with links to the original notes in the markdown viewer.                                            |
| List style       | Ordered List | Display embedded links as new lines, ordered, or unordered list.                                                                                      |
| Display panel    | No           | Display embedded links in a separate panel.                                                                                                           |
| Joplin icon      | Yes          | Display Joplin link icon next to embedded links.                                                                                                      |
| List header      | Embeddings   | Text to display as the header of the embedded links footer block.                                                                                     |
| List delimiter   | \\n          | Define a custom delimiter to seperate embedded links when the "New Line" list style is selected. (Default: \\n)                                       |
| Panel stylesheet |              | Path to custom CSS for styling the embedded links panel.                                                                                              |
| Disable text     |              | Use this text to prevent token replacement in a note. (default: <!-- embedded-notes-disable -->)                                                      |

## Installation
<!--
### Automatic

- Open Joplin and navigate to **Tools > Options > Plugins**.
- Search for **"Embedded Notes"** and click **Install**.
- Restart Joplin to enable the plugin.
-->
### Manual

- Download the latest `.jpl` file from [releases](https://github.com/njobnz/joplin-plugin-embedded-notes/releases/latest).
- Open Joplin and navigate to **Tools > Options > Plugins**.
- Click the gear icon and select **Install from file**.
- Choose the downloaded `.jpl` file and restart Joplin.

## Known issues and limitations

- **Switching Notes:** Tokens may not update immediately when switching between notes. Editing the note usually triggers the tokens to render.
- **Token Naming:** Token names cannot contain characters reserved for the opening and closing tags, or have spaces at the beginning or end. Use note ID tokens to reference notes with titles that include reserved characters.
- **Duplicate Titles:** Only the last note found with a duplicate title is used. To avoid ambiguity, reference notes with duplicate titles using their unique note ID.
- **Nested Tokens:** Nested token replacement is not supported.

## Acknowledgments

This plugin is inspired by and builds upon features from the following projects:

- [Note Variables Plugin](https://github.com/DanteCoder/JoplinPluginNoteVariables)
- [Joplin Extract Paragraphs](https://github.com/djsudduth/joplin-plugin-paragraph-extractor)
- [Joplin Note Link System](https://github.com/ylc395/joplin-plugin-note-link-system)
- [Quick Links Plugin for Joplin](https://github.com/roman-r-m/joplin-plugin-quick-links)
- [Embed search in note](https://github.com/ambrt/joplin-plugin-embed-search)

## License

This project is licensed under the [MIT License](LICENSE.md). See `LICENSE.md` for details.

import joplin from 'api';
import { SettingItem, SettingItemType, SettingStorage } from 'api/types';
import { localStoreSettingsKey, settingsSectionName as sectionName } from './constants';
import { PluginSettings } from './types';
import localization from './localization';

/**
 * Registers plugin settings.
 *
 * @returns {Promise<void>} A promise.
 */
export const registerSettings = async () => {
  const settingsSpec: Record<keyof PluginSettings, SettingItem> = {
    autocomplete: {
      public: true,
      section: sectionName,
      storage: SettingStorage.File,
      label: localization.setting__autocomplete,
      description: localization.setting__autocomplete__description,
      type: SettingItemType.Bool,
      value: true,
    },

    embeddedLinks: {
      public: true,
      section: sectionName,
      storage: SettingStorage.File,
      label: localization.setting__embeddedLinks,
      description: localization.setting__embeddedLinks__description,
      type: SettingItemType.Bool,
      value: false,
    },

    fenceOnly: {
      public: true,
      section: sectionName,
      storage: SettingStorage.File,
      label: localization.setting__fenceOnly,
      description: localization.setting__fenceOnly__description,
      type: SettingItemType.Bool,
      value: false,
    },

    idOnly: {
      public: true,
      section: sectionName,
      storage: SettingStorage.File,
      label: localization.setting__idOnly,
      description: localization.setting__idOnly__description,
      type: SettingItemType.Bool,
      value: false,
    },

    tag: {
      public: true,
      section: sectionName,
      storage: SettingStorage.File,
      label: localization.setting__tag,
      description: localization.setting__tag__description,
      type: SettingItemType.String,
      value: '',
    },

    prefix: {
      public: true,
      section: sectionName,
      storage: SettingStorage.File,
      label: localization.setting__prefix,
      description: localization.setting__prefix__description,
      type: SettingItemType.String,
      value: '%%',
    },

    suffix: {
      public: true,
      section: sectionName,
      storage: SettingStorage.File,
      label: localization.setting__suffix,
      description: localization.setting__suffix__description,
      type: SettingItemType.String,
      value: '%%',
    },

    blockFence: {
      public: true,
      section: sectionName,
      storage: SettingStorage.File,
      label: localization.setting__blockFence,
      description: localization.setting__blockFence__description,
      type: SettingItemType.Bool,
      value: true,
      advanced: true,
    },

    renderMarkdown: {
      public: true,
      section: sectionName,
      storage: SettingStorage.File,
      label: localization.setting__renderMarkdown,
      description: localization.setting__renderMarkdown__description,
      type: SettingItemType.Bool,
      value: false,
      advanced: true,
    },

    rendererTags: {
      public: true,
      section: sectionName,
      storage: SettingStorage.File,
      label: localization.setting__rendererTags,
      description: localization.setting__rendererTags__description,
      type: SettingItemType.String,
      value: '( ) [ ] { }',
      advanced: true,
    },

    embeddedLinksHeader: {
      public: true,
      section: sectionName,
      storage: SettingStorage.File,
      label: localization.setting__embeddedLinksHeader,
      description: localization.setting__embeddedLinksHeader__description,
      type: SettingItemType.String,
      value: 'Embeddings',
      advanced: true,
    },

    autocompleteKey: {
      public: true,
      section: sectionName,
      storage: SettingStorage.File,
      label: localization.setting__autocompleteKey,
      description: localization.setting__autocompleteKey__description,
      type: SettingItemType.String,
      value: 'ControlLeft',
      advanced: true,
    },
  };

  /**
   * Fetches plugin settings from Joplin's API and stores them in localStorage.
   * Makes settings easily accessible in non-async functions.
   *
   * This function is triggered whenever settings are changed.
   */
  const storeSettings = async () => {
    const settings = {};
    for (const setting in settingsSpec) {
      let value: any = (await joplin.settings.values(setting))[setting];
      // The tag setting is only supported as a tag-specific filter, but it can be overridden with a custom filter
      if (setting === 'tag' && value && !value.includes(':')) value = `tag:"${value}"`;
      if (setting === 'rendererTags') {
        const results = value.split(' ');
        const defaults = settingsSpec.rendererTags.value.split(' ');
        value = defaults.map((tag, index) => results[index] ?? tag);
      }
      settings[setting] = value;
    }
    localStorage.setItem(localStoreSettingsKey, JSON.stringify(settings));
  };

  await joplin.settings.registerSection(sectionName, {
    label: localization.settings__appName,
    description: localization.settings__description,
    iconName: 'fas fa-laptop-code',
  });
  await joplin.settings.registerSettings(settingsSpec);
  await joplin.settings.onChange(storeSettings);
  await storeSettings();
};

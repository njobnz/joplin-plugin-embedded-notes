import joplin from 'api';
import { SettingItem, SettingItemSubType, SettingItemType, SettingStorage } from 'api/types';
import { PluginSettings } from '../types';
import { EmbeddedLinksPosition, EmbeddedLinksType, SETTINGS_SECTION_NAME } from '../constants';
import localization from '../localization';
import getSetting from '../utils/getSetting';
import setSetting from '../utils/setSetting';
import App from '.';

/**
 * Registers plugin settings.
 *
 * @returns {Promise<void>} A promise.
 */
export default class AppSettings {
  app: App = null;

  constructor(app: App) {
    if (!app) throw Error('app cannot be null');
    this.app = app;
  }

  specification: Record<keyof PluginSettings, SettingItem> = null;

  /**
   * Get a setting from Joplin API.
   *
   * @returns {Promise<T>} The setting value.
   */
  get: <T>(name: string, fallback?: T) => Promise<T> = getSetting;

  /**
   * Set a setting using Joplin API.
   */
  set: (name: string, value?: any) => Promise<void> = setSetting;

  init = async () => {
    this.specification = {
      autocomplete: {
        public: true,
        section: SETTINGS_SECTION_NAME,
        storage: SettingStorage.File,
        label: localization.setting__autocomplete,
        description: localization.setting__autocomplete__description,
        type: SettingItemType.Bool,
        value: true,
      },

      fenceOnly: {
        public: true,
        section: SETTINGS_SECTION_NAME,
        storage: SettingStorage.File,
        label: localization.setting__fenceOnly,
        description: localization.setting__fenceOnly__description,
        type: SettingItemType.Bool,
        value: false,
      },

      idOnly: {
        public: true,
        section: SETTINGS_SECTION_NAME,
        storage: SettingStorage.File,
        label: localization.setting__idOnly,
        description: localization.setting__idOnly__description,
        type: SettingItemType.Bool,
        value: false,
      },

      tag: {
        public: true,
        section: SETTINGS_SECTION_NAME,
        storage: SettingStorage.File,
        label: localization.setting__tag,
        description: localization.setting__tag__description,
        type: SettingItemType.String,
        value: '',
      },

      prefix: {
        public: true,
        section: SETTINGS_SECTION_NAME,
        storage: SettingStorage.File,
        label: localization.setting__prefix,
        description: localization.setting__prefix__description,
        type: SettingItemType.String,
        value: '%^',
      },

      suffix: {
        public: true,
        section: SETTINGS_SECTION_NAME,
        storage: SettingStorage.File,
        label: localization.setting__suffix,
        description: localization.setting__suffix__description,
        type: SettingItemType.String,
        value: '^%',
      },

      listPosition: {
        public: true,
        section: SETTINGS_SECTION_NAME,
        storage: SettingStorage.File,
        label: localization.setting__listPosition,
        description: localization.setting__listPosition__description,
        type: SettingItemType.Int,
        value: EmbeddedLinksPosition.Footer,
        isEnum: true,
        options: {
          [EmbeddedLinksPosition.Footer]: 'Note Footer',
          [EmbeddedLinksPosition.Header]: 'Note Header',
          [EmbeddedLinksPosition.None]: 'None',
        },
      },

      listType: {
        public: true,
        section: SETTINGS_SECTION_NAME,
        storage: SettingStorage.File,
        label: localization.setting__listType,
        description: localization.setting__listType__description,
        type: SettingItemType.Int,
        value: EmbeddedLinksType.Ordered,
        isEnum: true,
        options: {
          [EmbeddedLinksType.Ordered]: 'Ordered List',
          [EmbeddedLinksType.Unordered]: 'Unordered List',
          [EmbeddedLinksType.Delimited]: 'New Lines',
        },
      },

      showPanel: {
        public: true,
        section: SETTINGS_SECTION_NAME,
        storage: SettingStorage.File,
        label: localization.setting__showPanel,
        description: localization.setting__showPanel__description,
        type: SettingItemType.Bool,
        value: false,
      },

      showIcon: {
        public: true,
        section: SETTINGS_SECTION_NAME,
        storage: SettingStorage.File,
        label: localization.setting__showIcon,
        description: localization.setting__showIcon__description,
        type: SettingItemType.Bool,
        value: true,
      },

      listHeader: {
        public: true,
        section: SETTINGS_SECTION_NAME,
        storage: SettingStorage.File,
        label: localization.setting__listHeader,
        description: localization.setting__listHeader__description,
        type: SettingItemType.String,
        value: 'Embeddings',
        advanced: true,
      },

      listDelimiter: {
        public: true,
        section: SETTINGS_SECTION_NAME,
        storage: SettingStorage.File,
        label: localization.setting__listDelimiter,
        description: localization.setting__listDelimiter__description,
        type: SettingItemType.String,
        value: '\\n',
        advanced: true,
      },

      customCss: {
        public: true,
        section: SETTINGS_SECTION_NAME,
        type: SettingItemType.String,
        label: localization.setting__customCss,
        description: localization.setting__customCss__description,
        subType: SettingItemSubType.FilePath,
        value: `${await joplin.settings.globalValue('profileDir')}/embedded-notes.css`,
        advanced: true,
      },

      disableText: {
        public: true,
        section: SETTINGS_SECTION_NAME,
        storage: SettingStorage.File,
        label: localization.setting__disableText,
        description: localization.setting__disableText__description,
        type: SettingItemType.String,
        value: '<!-- embedded-notes-disable -->',
        advanced: true,
      },
    };

    await joplin.settings.registerSection(SETTINGS_SECTION_NAME, {
      label: localization.settings__appName,
      description: localization.settings__description,
      iconName: 'fas fa-laptop-code',
    });
    await joplin.settings.registerSettings(this.specification);
  };
}

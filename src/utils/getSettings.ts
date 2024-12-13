import { localStoreSettingsKey } from '../constants';
import { PluginSettings } from '../types';

/**
 * Read stored settings from localStorage.
 *
 * @returns {PluginSettings} Plugin settings object.
 */
export const getSettings = (): PluginSettings =>
  JSON.parse(localStorage.getItem(localStoreSettingsKey));

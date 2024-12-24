import { LOCAL_STORE_SETTINGS_KEY } from '../constants';
import { PluginSettings } from '../types';

/**
 * Read stored settings from localStorage.
 *
 * @returns {T} Plugin settings object or specific setting.
 */
export default function readSettings<T>(name: string): T {
  const settings = JSON.parse(localStorage.getItem(LOCAL_STORE_SETTINGS_KEY)) || {};
  return settings[name] ? settings[name] as T : null;
}

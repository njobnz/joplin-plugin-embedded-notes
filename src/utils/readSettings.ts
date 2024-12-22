import { LOCAL_STORE_SETTINGS_KEY } from '../constants';
import { PluginSettings } from '../types';

/**
 * Read stored settings from localStorage.
 *
 * @returns {PluginSettings} Plugin settings object.
 */
export default (): PluginSettings => JSON.parse(localStorage.getItem(LOCAL_STORE_SETTINGS_KEY));

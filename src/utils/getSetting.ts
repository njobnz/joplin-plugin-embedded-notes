import joplin from 'api';
import parseSettings from './parseSettings';

export default async <T>(name: string, fallback: T = null): Promise<T> => {
  try {
    return parseSettings(name, (await joplin.settings.values(name))[name]) as T;
  } catch (e) {
    return fallback;
  }
};

import joplin from 'api';

export default async (name: string, fallback: any = null): Promise<any> => {
  try {
    return (await joplin.settings.values(name))[name];
  } catch (e) {
    return fallback;
  }
};

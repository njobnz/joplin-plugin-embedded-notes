import joplin from 'api';

export default async (name: string, value: any): Promise<void> => await joplin.settings.setValue(name, value);

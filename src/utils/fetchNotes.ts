import joplin from 'api';

export default async (path: string[], query?: string, fields?: string[], limit: number = 0): Promise<any[]> => {
  const results: any[] = [];

  for (let page = 1; ; page++) {
    try {
      const { items, has_more } = await joplin.data.get(path, {
        page,
        ...(fields && { fields }),
        ...(query && { query }),
      });
      results.push(...items);
      if (!has_more || (limit > 0 && results.length >= limit)) break;
    } catch (error) {
      console.error('Error fetching notes:', error);
      break;
    }
  }

  return results;
};

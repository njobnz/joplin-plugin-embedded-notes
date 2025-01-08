import { LOCAL_STORE_NOTES_KEY } from '../constants';
import debounceCache from '../utils/debounceCache';

const pattern = new RegExp(`^${LOCAL_STORE_NOTES_KEY}_[0-9A-Fa-f]{32}$`);

export default (id: string): void => {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key === `${LOCAL_STORE_NOTES_KEY}_${id}`) {
        removeNoteCache.cancel(key);
      } else {
        if (pattern.test(key)) removeNoteCache(key);
      }
    }
  } catch (e) {}
};

const removeNoteCache = debounceCache((key: string) => {
  localStorage.removeItem(key);
}, 10000);

import { EmbeddableNote } from '../types';
import { LOCAL_STORE_NOTES_KEY } from '../constants';

/**
 * Fetch the embeddable notes from local storage.
 *
 * @returns {Record<string, EmbeddableNote>} The embeddable notes from local storage
 */
export default (id: string): Record<string, EmbeddableNote> =>
  JSON.parse(localStorage.getItem(`${LOCAL_STORE_NOTES_KEY}_${id}`));

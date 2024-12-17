import { EmbeddableNote } from '../types';
import { localStoreNotesKey } from '../constants';

/**
 * Fetch the embeddable notes from local storage.
 *
 * @returns {Record<string, EmbeddableNote>} The embeddable notes from local storage
 */
export const readEmbeddableNotes = (): Record<string, EmbeddableNote> =>
  JSON.parse(localStorage.getItem(localStoreNotesKey));

import joplin from 'api';
import { fetchEmbeddableNotes } from './fetchEmbeddableNotes';
import { localStoreNotesKey } from '../constants';

/**
 * Retrieves embeddable notes and saves them to localStorage.
 */
export const loadEmbeddableNotes = async (): Promise<void> => {
  const notes = await fetchEmbeddableNotes(await joplin.workspace.selectedNote());
  localStorage.setItem(localStoreNotesKey, JSON.stringify(Object.fromEntries(notes)));
};

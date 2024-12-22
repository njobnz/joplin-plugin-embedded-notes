import joplin from 'api';
import { LOCAL_STORE_NOTES_KEY } from '../constants';
import fetchEmbeddableNotes from './fetchEmbeddableNotes';

/**
 * Retrieves embeddable notes and saves them to localStorage.
 */
export default async (): Promise<void> => {
  const notes = await fetchEmbeddableNotes(await joplin.workspace.selectedNote());
  localStorage.setItem(LOCAL_STORE_NOTES_KEY, JSON.stringify(Object.fromEntries(notes)));
};

import joplin from 'api';
import { JoplinNote } from '../types';
import { LOCAL_STORE_NOTES_KEY } from '../constants';
import setting from '../utils/getSetting';
import debounceCache from '../utils/debounceCache';
import fetchEmbeddableNotes from './fetchEmbeddableNotes';
import clearEmbeddableNotes from './clearEmbeddableNotes';

/**
 * Retrieves embeddable notes and saves them to localStorage.
 */
export default async (): Promise<void> => {
  const note = (await joplin.workspace.selectedNote()) as JoplinNote;
  const text = await setting<string>('disableText');

  if (note && !note.body.includes(text)) {
    const notes = await fetchEmbeddableNotes(note);
    const cache = `${LOCAL_STORE_NOTES_KEY}_${note.id}`;
    localStorage.setItem(cache, JSON.stringify(Object.fromEntries(notes)));
    clearEmbeddableNotesDelay(note.id);
  }
};

const clearEmbeddableNotesDelay = debounceCache(clearEmbeddableNotes, 8000);

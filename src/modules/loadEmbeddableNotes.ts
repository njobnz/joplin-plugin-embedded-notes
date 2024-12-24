import joplin from 'api';
import { JoplinNote, EmbeddableNote } from '../types';
import { LOCAL_STORE_NOTES_KEY } from '../constants';
import setting from '../utils/getSetting';
import fetchEmbeddableNotes from './fetchEmbeddableNotes';

/**
 * Retrieves embeddable notes and saves them to localStorage.
 */
export default async (): Promise<void> => {
  const note = (await joplin.workspace.selectedNote()) as JoplinNote;
  const text = await setting<string>('disableText');
  const notes = !note.body.includes(text) ? await fetchEmbeddableNotes(note) : new Map<string, EmbeddableNote>();
  localStorage.setItem(LOCAL_STORE_NOTES_KEY, JSON.stringify(Object.fromEntries(notes)));
};

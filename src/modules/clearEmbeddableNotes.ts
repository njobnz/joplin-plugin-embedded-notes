import { LOCAL_STORE_NOTES_KEY } from '../constants';

export default (id: string): void => {
  try {
    localStorage.removeItem(`${LOCAL_STORE_NOTES_KEY}_${id}`);
  } catch (e) {}
};

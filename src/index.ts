import joplin from 'api';
import { App } from './plugins';

joplin.plugins.register({
  onStart: async () => {
    await App.init();
  },
});

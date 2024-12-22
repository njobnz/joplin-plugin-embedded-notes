import joplin from 'api';
import App from './plugins';

let embeddedNotesApp: App = null;

joplin.plugins.register({
  onStart: async () => {
    embeddedNotesApp = new App();
    await embeddedNotesApp.init();
  },
});

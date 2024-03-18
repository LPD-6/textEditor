const { ipcRenderer } = require('electron');

let editor = document.getElementById('editor');

ipcRenderer.on('file-opened', (event, args) => {
  editor.textContent = args.content;
});

ipcRenderer.on('open-file', () => {
  ipcRenderer.send('open-file');
});

ipcRenderer.on('save-file', () => {
  ipcRenderer.send('save-file', { content: editor.textContent });
});

ipcRenderer.on('save-file-as', () => {
  ipcRenderer.send('save-file-as', { content: editor.textContent });
});

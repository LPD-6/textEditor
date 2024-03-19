const { ipcRenderer } = require('electron');

let editor = document.getElementById('editor');

// Listen for file opened from main process
ipcRenderer.on('file-opened', (event, args) => {
  editor.innerText = args.content;
});

// Listen for open file from main process
ipcRenderer.on('open-file', () => {
  ipcRenderer.send('open-file');
});

// Listen for save message from main process
ipcRenderer.on('save-file', () => {
  ipcRenderer.send('save-file', { content: editor.innerText });
});

// Listen for save-as message from main process
ipcRenderer.on('save-file-as', () => {
  ipcRenderer.send('save-file-as', { content: editor.innerText });
});

// Listen for theme change message from main process
ipcRenderer.on('apply-theme', (event, theme) => {
  document.body.className = theme + '-theme';
 });
const { ipcRenderer } = require('electron');

ipcRenderer.on('file-opened', (event, data) => {
  document.getElementById('editor').value = data;
});

ipcRenderer.on('save-file', (event, filePath) => {
  const data = document.getElementById('editor').value;
  ipcRenderer.send('save-data', filePath, data);
});

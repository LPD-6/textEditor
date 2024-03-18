const { app, BrowserWindow, Menu, dialog, ipcMain } = require('electron');
const fs = require('fs');

let mainWindow;

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.loadFile('index.html');

  const menu = Menu.buildFromTemplate([
    {
      label: '&File',
      submenu: [
        {
          label: 'New File',
          accelerator: 'CmdOrCtrl+N',
          click(){
            mainWindow.createWindow();
          }
        },
        {
          label: 'Open',
          accelerator: 'CmdOrCtrl+O',
          click() {
            mainWindow.webContents.send('open-file');
          }
        },
        {
          label: 'Save',
          accelerator: 'CmdOrCtrl+S',
          click(){
            mainWindow.webContents.send('save-file');
          }
        },
        {
          label: 'Save As',
          accelerator: 'CmdOrCtrl+Shift+S',
          click() {
            mainWindow.webContents.send('save-file-as');
          }
        },
        {type: 'separator'},
        {role: 'quit'}
      ]
    },

    {
      label: '&Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { type: 'separator' },
        { role: 'selectAll' }
      ]
    },
    
    {
      label: '&View',
      submenu: [
        { role: 'reload' },
        { role: 'toggleDevTools' }
      ]
    }
  ]);

  Menu.setApplicationMenu(menu);
}

app.whenReady().then(createWindow);

ipcMain.on('open-file', (event) => {
  dialog.showOpenDialog(mainWindow, {
    properties: ['openFile']
  }).then(result => {
    if (!result.canceled) {
      fs.readFile(result.filePaths[0], 'utf-8', (err, data) => {
        if (err) {
          console.error('Error reading file:', err);
          return;
        }
        event.reply('file-opened', { path: result.filePaths[0], content: data });
      });
    }
  }).catch(err => {
    console.error('Error opening file dialog:', err);
  });
});

ipcMain.on('save-file', (event, args) => {
  let content = args.content;
  let lines = content.split('\n');
  lines = lines.map(line => line + '\n');
  content = lines.join('');

  dialog.showSaveDialog(mainWindow, {}).then(result => {
    if (!result.canceled) {
      fs.writeFile(result.filePath, content, 'utf-8', (err) => {
        if (err) {
          console.log("An error occurred while saving the file: " + err.message);
          return;
        }
        console.log("File saved successfully.");
      });
    }
  }).catch(err => {
    console.error('Error saving file:', err);
  });
});

ipcMain.on('save-file-as', (event, args) => {
  let content = args.content;
  let lines = content.split('\n');
  lines = lines.map(line => line + '\n');
  content = lines.join('');

  dialog.showSaveDialog(mainWindow, {}).then(result => {
    if (!result.canceled) {
      fs.writeFile(result.filePath, content, 'utf-8', (err) => {
        if (err) {
          console.log("An error occurred while saving the file: " + err.message);
          return;
        }
        console.log("File saved successfully.");
      });
    }
  }).catch(err => {
    console.error('Error saving file:', err);
  });
});

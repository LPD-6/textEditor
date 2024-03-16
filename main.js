const { app, BrowserWindow, Menu, dialog } = require('electron');
const fs = require('fs');

let mainWindow;

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    }
  });

  mainWindow.loadFile('index.html');

  const menu = Menu.buildFromTemplate([
    {
      label: 'File',
      submenu: [
        {
          label: 'Open',
          click() {
            dialog.showOpenDialog(mainWindow, {
              properties: ['openFile']
            }).then(result => {
              if (!result.canceled) {
                fs.readFile(result.filePaths[0], 'utf-8', (err, data) => {
                  if(err){
                      console.log("An error occurred reading the file :" + err.message);
                      return;
                  }
                  mainWindow.webContents.send('file-opened', data);
                });
              }
            }).catch(err => {
              console.log(err)
            });
          }
        },
        {
          label: 'Save',
          click() {
            dialog.showSaveDialog(mainWindow).then(result => {
              if (!result.canceled) {
                mainWindow.webContents.send('save-file', result.filePath);
              }
            }).catch(err => {
              console.log(err)
            });
          }
        }
      ]
    }
  ]);

  Menu.setApplicationMenu(menu);
}

app.whenReady().then(createWindow);

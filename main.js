const { app, BrowserWindow, Menu, dialog, ipcMain } = require('electron');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

let windows = {};
let filePaths = {};
const themes = ['light', 'dark', 'blue', 'green', 'halloween'];

function createWindow() {
  let token = generateUniqueToken();
  let win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  windows[token] = win;
  filePaths[token] = null;
  win.on('closed', () => {
    delete windows[token];
    delete filePaths[token];
  });
  win.loadFile('index.html');

  // Apply the theme
  const theme = getThemePreference();
  win.webContents.executeJavaScript(`document.body.className = '${theme}-theme';`);

  const menu = Menu.buildFromTemplate([
    {
      label: '&File',
      submenu: [
        {
          label: 'New File',
          accelerator: 'CmdOrCtrl+N',
          click() {
            createWindow();
          }
        },
        {
          label: 'Open',
          accelerator: 'CmdOrCtrl+O',
          click() {
            win.webContents.send('open-file');
          }
        },
        {
          label: 'Save',
          accelerator: 'CmdOrCtrl+S',
          click() {
            win.webContents.send('save-file');
          }
        },
        {
          label: 'Save As',
          accelerator: 'CmdOrCtrl+Shift+S',
          click() {
            win.webContents.send('save-file-as');
          }
        },
        { type: 'separator' },
        { role: 'quit' }
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
    },

    {
      label: '&Settings',
      submenu: [{
        label: 'Change Theme',
        submenu: themes.map(theme => ({
          label: `Switch to ${theme.charAt(0).toUpperCase() + theme.slice(1)} Theme`,
          click() {
            saveThemePreference(theme); // Save the new theme
            const windows = BrowserWindow.getAllWindows();
            windows.forEach(win => {
              win.webContents.executeJavaScript(`document.body.className = '${theme}-theme';`); // Apply the new theme to all windows
            });
          }
        }))
      }
      ]
    }
  ]);

  Menu.setApplicationMenu(menu);
}

app.whenReady().then(createWindow);

ipcMain.on('open-file', (event, win) => {
  let token = getTokenForWindow(win)
  dialog.showOpenDialog(win, {
    properties: ['openFile']
  }).then(result => {
    if (!result.canceled) {
      fs.readFile(result.filePaths[0], 'utf-8', (err, data) => {
        if (err) {
          console.error('Error reading file:', err);
          return;
        }
        filePaths[token] = result.filePaths[0];
        event.reply('file-opened', { path: filePaths[token], content: data });
      });
    }
  }).catch(err => {
    console.error('Error opening file dialog:', err);
  });
});

ipcMain.on('save-file', (event, args, win) => {
  let token = getTokenForWindow(win)
  let content = args.content;
  let lines = content.split('\n');
  lines = lines.map((line, index) => {
    // Don't add a new line character to the last line
    if (index === lines.length - 1) {
      return line;
    } else {
      return line + '\n';
    }
  });
  content = lines.join('');

  if (filePaths[token]) {
    fs.writeFile(filePaths[token], content, 'utf-8', (err) => {
      if (err) {
        console.log("An error occurred while saving the file: " + err.message);
        return;
      }
      console.log("File saved successfully.");
    });
  } else {
    dialog.showSaveDialog(win, {}).then(result => {
      if (!result.canceled) {
        fs.writeFile(result.filePath, content, 'utf-8', (err) => {
          if (err) {
            console.log("An error occurred while saving the file: " + err.message);
            return;
          }
          filePaths[token] = result.filePath;
          console.log("File saved successfully.");
        });
      }
    }).catch(err => {
      console.error('Error saving file:', err);
    });
  }
});

ipcMain.on('save-file-as', (event, args, win) => {
  let token = getTokenForWindow(win)
  let content = args.content;
  let lines = content.split('\n');
  lines = lines.map((line, index) => {
    // Don't add a new line character to the last line
    if (index === lines.length - 1) {
      return line;
    } else {
      return line + '\n';
    }
  });
  content = lines.join('');

  dialog.showSaveDialog(win, {}).then(result => {
    if (!result.canceled) {
      fs.writeFile(result.filePath, content, 'utf-8', (err) => {
        if (err) {
          console.log("An error occurred while saving the file: " + err.message);
          return;
        }
        filePaths[token] = result.filePath;
        console.log("File saved successfully.");
      });
    }
  }).catch(err => {
    console.error('Error saving file:', err);
  });
});

// Function to save theme preference
function saveThemePreference(theme) {
  try {
    const prefsPath = path.join(app.getPath('userData'), 'preferences.json');
    const prefs = { theme: theme };
    fs.writeFileSync(prefsPath, JSON.stringify(prefs));
    console.log('Theme preference saved successfully.');
  } catch (error) {
    console.error('Error saving theme preference:', error);
  }
}

function getThemePreference() {
  try {
    const prefsPath = path.join(app.getPath('userData'), 'preferences.json');
    if (fs.existsSync(prefsPath)) {
      const prefs = JSON.parse(fs.readFileSync(prefsPath));
      return prefs.theme;
    }
  } catch (error) {
    console.error('Error reading theme preference:', error);
  }
  return themes[0]; // Default theme
}


function generateUniqueToken() {
  return uuidv4();
}

function getTokenForWindow(win) {
  return Object.keys(windows).find(key => windows[key] === win);
}
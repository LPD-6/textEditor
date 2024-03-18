const { ipcRenderer } = require('electron');

let tabsContainer = document.getElementById('tabs');
let editorsContainer = document.getElementById('editors');
let tabs = [];
let editors = [];
let currentFilePath = null;

// Function to activate a tab and its corresponding editor
function activateTab(tab, editor) {
  // Hide all editors
  editors.forEach((ed) => ed.classList.remove('active'));

  // Show the corresponding editor
  editor.classList.add('active');

  // Remove 'active' class from all tabs
  tabs.forEach((t) => t.classList.remove('active'));

  // Add 'active' class to the clicked tab
  tab.classList.add('active');
}

// Create an initial tab and editor upon application launch
let initialTab = document.createElement('div');
initialTab.classList.add('tab', 'active');
initialTab.textContent = 'Untitled';
tabsContainer.appendChild(initialTab);
tabs.push(initialTab);

let initialEditor = document.createElement('div');
initialEditor.classList.add('editor', 'active');
initialEditor.contentEditable = true;
editorsContainer.appendChild(initialEditor);
editors.push(initialEditor);

// Event listeners for tab creation and switching
ipcRenderer.on('file-opened', (event, args) => {
  // Create a new tab representing the opened file
  let tab = document.createElement('div');
  tab.classList.add('tab');
  tab.textContent = args.fileName; // Set tab name to file name
  tabsContainer.appendChild(tab);
  tabs.push(tab);

  // Create a new editor
  let editor = document.createElement('div');
  editor.classList.add('editor');
  editor.contentEditable = true; // Make editor content editable
  editorsContainer.appendChild(editor);
  editors.push(editor);

  // Display content of opened file in the editor
  editor.innerText = args.content;

  // Add click event listener to the tab
  tab.addEventListener('click', () => {
    let index = tabs.indexOf(tab);
    activateTab(tab, editors[index]);
  });
});

ipcRenderer.on('open-file', () => {
  ipcRenderer.send('open-file');
});

ipcRenderer.on('save-file', () => {
  ipcRenderer.send('save-file', { content: editors[tabs.indexOf(document.querySelector('.tab.active'))].innerText });
});

ipcRenderer.on('save-file-as', () => {
  ipcRenderer.send('save-file-as', { content: editors[tabs.indexOf(document.querySelector('.tab.active'))].innerText });
});

ipcRenderer.on('change-theme', () => {
  document.body.classList.toggle('dark-theme');
});

ipcRenderer.on('new-file', () => {
  // Hide the previous tab and editor
  let currentEditor = editors[tabs.indexOf(document.querySelector('.tab.active'))];
  currentEditor.style.display = 'none';

  // Create a new tab with "Untitled" name
  let tab = document.createElement('div');
  tab.classList.add('tab');
  tab.textContent = 'Untitled';
  tabsContainer.appendChild(tab);
  tabs.unshift(tab);

  // Create a new editor
  let editor = document.createElement('div');
  editor.classList.add('editor');
  editor.contentEditable = true;
  editorsContainer.appendChild(editor);
  editors.unshift(editor);

  // Add click event listener to the tab
  tab.addEventListener('click', () => {
    let index = tabs.indexOf(tab);
    activateTab(tab, editors[index]);
  });

  // Trigger click event to show the new editor
  activateTab(tab, editor);
});

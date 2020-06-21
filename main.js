const { app,
  BrowserWindow,
  ipcMain,
  Tray,
  Menu,
  globalShortcut,
  shell,
  dialog } = require("electron");
const path = require("path");
const fs = require("fs");
const os = require("os");
const Store = require('./Store')
const iconPath = path.join(__dirname, "assets", "icons", "icon.png");
var player = require('play-sound')(opts = {})

let tray = null;


console.log(app.getPath("userData"))
const preferences = new Store({
  configName: 'user-preferences',
  defaults: {
    destination: path.join(os.homedir(), 'screenshots')
  }
})

let destination = preferences.get("destination")
const isDev =
  process.env.NODE_ENV !== undefined && process.env.NODE_ENV === "development"
    ? true
    : false;

const isMac = process.platform === "darwin" ? true : false;
let win = null
function createWindow() {
  win = new BrowserWindow({
    width: 600,
    height: 600,
    backgroundColor: "#eee",
    show: false,
    icon: iconPath,
    webPreferences: {
      nodeIntegration: true,
    },
  });
  win.loadFile("./src/index.html");
  if (isDev) {
    win.webContents.openDevTools();
  }
  win.once("ready-to-show", () => {
    // win.show();
    setTimeout(() => {
      win.webContents.send("cpu_name", os.cpus()[0].model);
    }, 3000);
  });
}
function createPreferenceWindow() {

  const preferenceWindow = new BrowserWindow({
    title: 'Recorder Preferences',
    width: 500,
    height: 150,
    // resizable: false,
    show: false,
    backgroundColor: '#eee',
    webPreferences: {
      nodeIntegration: true
    }
  })

  preferenceWindow.loadFile('./src/preferences/index.html')
  preferenceWindow.once('ready-to-show', () => {
    preferenceWindow.show();

    preferenceWindow.webContents.send('dest-path-update', destination)
    if (isDev)
      preferenceWindow.openDevTools()
  })

}
app.whenReady().then(() => {
  createWindow();
  globalShortcut.register('Cmd+Shift+D', () => {
    console.log('ScreenShot Trigger')
    win.webContents.send('take-screenshot')
    player.play('./assets/picture.wav', function (err) {
      if (err) throw err
    })
  })
  tray = new Tray(path.join(__dirname, "assets", "tray-icon.png"))
  const contextMenu = Menu.buildFromTemplate([
    { label: "Preferences", click: () => { createPreferenceWindow() } },
    { type: 'separator' },
    { role: isMac ? 'Quit' : 'Close' }
  ])
  tray.setContextMenu(contextMenu)

});
app.on('will-quit', () => {
  globalShortcut.unregisterAll();
})
app.on("window-all-closed", () => {
  console.log("Todas as janelas fechadas");
  if (!isMac) {
    app.quit();
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
ipcMain.handle("show-dialog", async (event) => {
  const result = await dialog.showOpenDialog({ properties: ['openDirectory'] })
  const dirPath = result.filePaths[0];
  preferences.set("destination", dirPath)
  destination = preferences.get("destination")
  return destination
})
ipcMain.handle("screenshot", (event, base64Image) => {
  const base64Data = base64Image.replace(/^data:image\/png;base64,/, "");
  const fileName = `ScreenShot-${Date.now()}.png`
  const filePath = path.join(destination, fileName)
  fs.writeFile(filePath, base64Data, 'base64', function (err) {
    console.log("Saved")
  });
  return ({ fileName, filePath })
});
ipcMain.on("open-file", (event, data) => {
  shell.openPath(data.filePath)
})
ipcMain.handle('showDialog', async (event) => {

  const result = await dialog.showOpenDialog({
    properties: ['openDirectory']
  })

  const filePath = result.filePaths[0]
  preferences.set('dest', filePath)
  destination = preferences.get("dest")
  // ipcRenderer.send('change-dest', filePath)
  return destination

})

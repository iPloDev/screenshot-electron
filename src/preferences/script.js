
// const { preferences } = require('../store.js')

const { ipcRenderer } = require('electron')

const destPath = document.querySelector('#dest-path')
function choose() {
    ipcRenderer.invoke('showDialog').then(destination => {
        destPath.value = destination
    })
}

ipcRenderer.on('dest-path-update', (event, path) => {
    destPath.value = path
})






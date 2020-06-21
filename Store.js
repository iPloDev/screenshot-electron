const { app, shell } = require('electron')
const fs = require('fs')
const path = require('path')

class Store {

    constructor(options) {
        console.log(" Start")
        const userDataPath = app.getPath("userData")
        console.log(" end")
        shell.openPath(userDataPath)

        this.path = path.join(userDataPath, options.configName + '.json')
        this.data = parseDataFile(this.path, options.defaults)
    }

    get(key) {
        return this.data[key]
    }

    set(key, value) {
        this.data[key] = value;
        fs.writeFileSync(this.path, JSON.stringify(this.data))
    }

}

function parseDataFile(filePath, defaults) {
    try {
        return JSON.parse(fs.readFileSync(filePath))
    } catch{
        return defaults
    }
}

module.exports = Store
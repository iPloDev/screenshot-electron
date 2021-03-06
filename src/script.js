const { ipcRenderer, desktopCapturer, ipcMain } = require("electron")
const path = require('path')

function fullscreenShot() {
console.log("Taking screenShot")
    desktopCapturer.getSources({ types: ['window', 'screen'] }).then(async sources => {
        sources.forEach(async source => {
            console.log(source)
            if ((source.name === "Entire Screen") ||
                (source.name === "Screen 1") ||
                (source.name === "Screen 2")) {

                    try {
                        const stream = await navigator.mediaDevices.getUserMedia({
                            audio: false,
                            video: {
                                mandatory: {
                                    maxWidth: 8000,
                                    chromeMediaSource: 'desktop',
                                    chromeMediaSourceId: source.id,
                                }
                            }
                        })
                        console.log(stream)
                        handleStream(stream)
                    } catch (error) {
                        console.log(error)
                    }
               

            }
        })
    })

    function handleStream(stream) {
        console.log(" handleStream")
        const video = document.createElement("video");
        video.srcObject = stream
        video.onloadedmetadata = () => {
            video.play()

            const canvas = document.createElement('canvas')
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d')
            context.drawImage(video, 0, 0, canvas.width, canvas.height)
            const base64Image = canvas.toDataURL('image/png')
            // ipcRenderer.send('screenshot', base64Image)
            ipcRenderer.invoke('screenshot', base64Image).then(data => {
                sendNotification(data)

            })
            video.remove();
            try {
                stream.getTracks()[0].stop();
            } catch (e) { }
        }
    }


    function sendNotification(data) {
        const notification = new Notification("Screenshot", {
            body: data.fileName,
            icon: path.join(__dirname, '../assets/icons/icon.png'),

        })
        notification.addEventListener("click", function () {
            ipcRenderer.send('open-file', data)
        });
    }

}

ipcRenderer.on("take-screenshot", () => {
    fullscreenShot()
})


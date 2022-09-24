const volume = document.getElementById("volume");
const bass = document.getElementById("bass");
const mid = document.getElementById("mid");
const treble = document.getElementById("treble");
const visualizer = document.getElementById("visualizer");

const context = new AudioContext();

setUpContext()

async function setUpContext() {
    const guitar = await getGuitar()
    // the browser automatically blocks audio output until the user clicks on the page. To bypass this, we check if .state is "suspended" and if so, we call resume(). The state will now be "running".
    if (context.state === "suspended") {
        await context.resume()
    }
    const source = context.createMediaStreamSource(guitar)
    source.connect(context.destination)
}

function getGuitar() {
    return navigator.mediaDevices.getUserMedia({
        audio: {
            autoGainContorl: false,
            noiseSuppression: false,
            latency: 0
        }
    })
}
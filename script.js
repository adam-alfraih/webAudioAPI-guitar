const volume = document.getElementById("volume");
const bass = document.getElementById("bass");
const mid = document.getElementById("mid");
const treble = document.getElementById("treble");
const visualizer = document.getElementById("visualizer");

const context = new AudioContext();
const analyserNode = new AnalyserNode(context, { fftSize: 1024 })
const gainNode = new GainNode(context, {gain: volume.value})
const bassEQ = new BiquadFilterNode(context, {
  type: 'lowshelf',
  frequency: 500,
  gain: bass.value
})
const midEQ = new BiquadFilterNode(context, {
  type: 'peaking',
  Q: Math.SQRT1_2,
  frequency: 1500,
  gain: bass.value
})
const trebleEQ = new BiquadFilterNode(context, {
    type: 'highshelf',
    frequency: 3000,
    gain: bass.value
  })

setupEventListeners()
setUpContext()
resize()
drawVisualizer()

function setupEventListeners() {
    window.addEventListener('resize', resize)

    volume.addEventListener('input', e => {
        const value = parseFloat(e.target.value)
        // setTargetAtTime smoothens out volume transitions so that there is no click or popping sounds
        gainNode.gain.setTargetAtTime(value, context.currentTime, .01)
    })
    
    bass.addEventListener('input', e => {
        const value = parseInt(e.target.value)
        // setTargetAtTime smoothens out volume transitions so that there is no click or popping sounds
        bassEQ.gain.setTargetAtTime(value, context.currentTime, .01)
    })

    mid.addEventListener('input', e => {
        const value = parseInt(e.target.value)
        // setTargetAtTime smoothens out volume transitions so that there is no click or popping sounds
        midEQ.gain.setTargetAtTime(value, context.currentTime, .01)
    })

    treble.addEventListener('input', e => {
        const value = parseInt(e.target.value)
        // setTargetAtTime smoothens out volume transitions so that there is no click or popping sounds
        trebleEQ.gain.setTargetAtTime(value, context.currentTime, .01)
    })
}

async function setUpContext() {
    const guitar = await getGuitar()
    // the browser automatically blocks audio output until the user clicks on the page. To bypass this, we check if .state is "suspended" and if so, we call resume(). The state will now be "running".
    if (context.state === "suspended") {
        await context.resume()
    }
    const source = context.createMediaStreamSource(guitar)
    source
        .connect(midEQ)
        .connect(bassEQ)
        .connect(trebleEQ)
        .connect(gainNode)
        .connect(analyserNode)
        .connect(context.destination)
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

function drawVisualizer() {
    requestAnimationFrame(drawVisualizer)
  
    const bufferLength = analyserNode.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    analyserNode.getByteFrequencyData(dataArray)
    const width = visualizer.width
    const height = visualizer.height
    const barWidth = width / bufferLength
  
    const canvasContext = visualizer.getContext('2d')
    canvasContext.clearRect(0, 0, width, height)
  
    dataArray.forEach((item, index) => {
      const y = item / 255 * height
      const x = barWidth * index
  
      canvasContext.fillStyle = `hsl(${y / height * 200}, 100%, 50%)`
      canvasContext.fillRect(x, height - y, barWidth, y)
    })
  }

function resize() {
    visualizer.width = visualizer.clientWidth *
    window.devicePixelRatio
    visualizer.height = visualizer.clientHeight *
    window.devicePixelRatio
}
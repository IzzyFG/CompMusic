//Adapted from https://www.marksantolucito.com/COMS3430/spring2024/biquad/
var audioCtx1;
var audioCtx2;
var biquadFilter;
var lowPass_1;
var lowPass_2;
var lowPass_fire;
var rhpf;
var brownNoise;
var whiteNoise;
var analyser;
var dataArray;
var bufferLength;
var canvasCtx;
var WIDTH;
var HEIGHT;
var running;
var compressor;
var rhpf_fire;


$(function() {
    window.addEventListener("resize", resizeCanvas, false);

    function resizeCanvas(){
        WIDTH = ($("#brook_body").width());
        HEIGHT = WIDTH/2;
        $('#visualizer').width(WIDTH).height(HEIGHT);
        
        canvasCtx = document.getElementById("visualizer").getContext("2d");
    }
    resizeCanvas();

    
    initAudioCtx();
    babblingBrook();
    campfire();
    running = false;
});

function initAudioCtx(){
    audioCtx1 = new (window.AudioContext || window.webkitAudioContext);
    audioCtx2 = new (window.AudioContext || window.webkitAudioContext)

};


/* based on : {RHPF.ar( //resonant high pass filter
    LPF.ar(
        BrownNoise.ar(), //Generates noise whose spectrum falls off in power by 6 dB per octave. //mul 1
        400), // in = Brown Noise, cutoffFreq = 400
    
    LPF.ar(
        BrownNoise.ar(),
        14) * 400 + 500, // in = Brown Noise, cutoffFreq = 14, LPF()*400+500
    0.03,
    0.1) 
    
    // input signal = LPF.ar[1]
    // cutoffFreq = LPF.ar[2] * 400 + 500
    // rq (The reciprocal of Q (bandwidth / cutoffFreq)) = 0.03
    // output multiplied by 0.1
}*/ 
   

function babblingBrook() {
    var bufferSize = 10 * audioCtx1.sampleRate,
        noiseBuffer = audioCtx1.createBuffer(1, bufferSize, audioCtx1.sampleRate),
        output = noiseBuffer.getChannelData(0);

    var lastOut = 0;
    for (var i = 0; i < bufferSize; i++) {
        var brown = Math.random() * 2 - 1;
    
        output[i] = (lastOut + (0.02 * brown)) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5;
    }

    brownNoise = audioCtx1.createBufferSource();
    brownNoise.buffer = noiseBuffer;
    brownNoise.loop = true;
    brownNoise.start(0);

    lowPass_1 = audioCtx1.createBiquadFilter();

    lowPass_1.type = "lowpass";
    lowPass_1.frequency.setValueAtTime(400, audioCtx1.currentTime);
    lowPass_1.gain.setValueAtTime(0, audioCtx1.currentTime);

    lowPass_2 = audioCtx1.createBiquadFilter();

    lowPass_2.type = "lowpass";
    lowPass_2.frequency.setValueAtTime(14, audioCtx1.currentTime);
    lowPass_2.gain.setValueAtTime(0, audioCtx1.currentTime);


    rhpf = audioCtx1.createBiquadFilter();

    rhpf.type = "highpass";
    rhpf.frequency = lowPass_2* 400 + 500;
    rhpf.gain.setValueAtTime(0.1, audioCtx1.currentTime);

    rhpf.Q.setValueAtTime(.003, audioCtx1.currentTime);

    brownNoise.connect(lowPass_1).connect(rhpf).connect(audioCtx1.destination);

    analyser = audioCtx1.createAnalyser();

    rhpf.connect(analyser);
    analyser.connect(audioCtx1.destination);
    analyser.fftSize = 2048;
    // bufferLength = analyser.frequencyBinCount;
    
    // console.log(bufferLength);
    // dataArray = new Uint8Array(bufferLength);
    

    // canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
    // draw();

};


function draw() {
    drawVisual = requestAnimationFrame(draw);

    analyser.getByteFrequencyData(dataArray);

    canvasCtx.fillStyle = 'rgb(0, 0, 0)';

    canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);


    var barWidth = (WIDTH / bufferLength) * 2.5;
    var barHeight;
    var x = 0;

    for (var i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i]*2;

        canvasCtx.fillStyle = 'rgb(' + (barHeight + 100) + ',50,50)';
        canvasCtx.fillRect(x, (HEIGHT-barHeight)/2, barWidth, barHeight*-1);

        x += barWidth + 1;
    }
};




const playBrook= document.getElementById('start_brook');
playBrook.addEventListener('click', function () {

    if (audioCtx1.state === 'suspended') {
        if (audioCtx2.state === 'running') {
            audioCtx2.suspend();
        }
        audioCtx1.resume();
    }

    if (audioCtx1.state === 'running') {
        audioCtx1.suspend();
    }

    


}, false);


/* 
* 3-80Hz range
* hissing =  white noise generator 
* modulate hissing w/ random low-frequency signal
*/

function campfire() {
    var fire_bufferSize =  10*audioCtx2.sampleRate,
    noiseBuffer = audioCtx2.createBuffer(1, fire_bufferSize, audioCtx2.sampleRate),
    output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < fire_bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * 0.5;
    }
    whiteNoise = audioCtx2.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;
        
    whiteNoise.start(0);

    lowPass_fire = audioCtx2.createBiquadFilter();

    lowPass_fire.type = "lowpass";
    lowPass_fire.frequency.setValueAtTime(Math.random()*9000+400, audioCtx2.currentTime);
    lowPass_fire.gain.setValueAtTime(0, audioCtx2.currentTime);

    compressor = audioCtx2.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(1, audioCtx2.currentTime);
    compressor.threshold.setValueAtTime(1, audioCtx2.currentTime);

    rhpf_fire = audioCtx1.createBiquadFilter();

    rhpf_fire.type = "highpass";
    rhpf_fire.frequency = 500;
    rhpf_fire.gain.setValueAtTime(1800, audioCtx1.currentTime);

    whiteNoise.connect(lowPass_fire).connect(audioCtx2.destination);
    compressor.connect(audioCtx2.destination);
    rhpf.connect(audioCtx2.destination);
   
};

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


async function hissing() {
    while(running){
        
        audioCtx2.resume();
        await sleep(Math.random()*250+50);

        audioCtx2.suspend(); 
        await sleep( Math.random()*5000);
    }
}
// repeat with the interval of 2 seconds
// let timerId = setInterval(() => playHiss(), 5000);

// after 5 seconds stop

const playFire= document.getElementById('start_fire');
playFire.addEventListener('click', function () {

    if (audioCtx2.state === 'suspended') {
        if (audioCtx1.state === 'running') {
            audioCtx1.suspend();
        }
        // timerId = setInterval(() => fireplace(), 5000);
        // setTimeout(() => { clearInterval(timerId);  }, 6000);
        // fireplace();
        // setTimeout(fireplace, 4000);
        // playHiss();    
        // audioCtx2.resume();

    }

    if (audioCtx2.state === 'running') {
        audioCtx2.suspend();
    }
    running = !running;
    hissing();


}, false);

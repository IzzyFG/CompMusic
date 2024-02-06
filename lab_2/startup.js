var audioCtx;

var noteFreq;


var notePitches = {
	1:{
		"C" 	:	32.703195662574829,
		"C#" 	:	34.647828872109012,
		"D" 	:	36.708095989675945,
		"D#"	:	38.890872965260113,
		"E" 	:	41.203444614108741,
		"F" 	:	43.653528929125485,
		"F#" 	:	46.249302838954299,
		"G" 	:	48.999429497718661,
		"G#"	:	51.913087197493142,
		"A" 	:	55.000000000000000,
		"A#" 	:	58.270470189761239,
		"B" 	:	61.735412657015513,
	},
	2:{
		"C" 	:	65.406391325149658,
		"C#" 	:	69.295657744218024,
		"D" 	:	73.41619197935189,
		"D#"	:	77.781745930520227,
		"E" 	:	82.406889228217482,
		"F" 	:	87.307057858250971,
		"F#" 	:	92.498605677908599,
		"G" 	:	97.998858995437323,
		"G#"	:	103.826174394986284,
		"A" 	:	110.0,
		"A#" 	:	116.540940379522479,
		"B" 	:	123.470825314031027,
	},
	3:{
		"C" 	:	130.812782650299317,
		"C#" 	:	138.591315488436048,
		"D" 	:	146.83238395870378,
		"D#"	:	155.563491861040455,
		"E" 	:	164.813778456434964,
		"F" 	:	174.614115716501942,
		"F#" 	:	184.997211355817199,
		"G" 	:	195.997717990874647,
		"G#"	:	207.652348789972569,
		"A" 	:	220.0,
		"A#" 	:	233.081880759044958,
		"B" 	:	246.941650628062055,
	},
	4:{
		"C" 	:	261.625565300598634,
		"C#" 	: 	277.182630976872096,
		"D" 	:	293.66476791740756,
		"D#"	: 	311.12698372208091,
		"E" 	:	329.627556912869929,
		"F" 	:	349.228231433003884,
		"F#" 	: 	369.994422711634398,
		"G" 	:	391.995435981749294,
		"G#"	: 	415.304697579945138,
		"A" 	:	440.0,
		"A#" 	: 	466.163761518089916,
		"B" 	:	493.883301256124111,
	},
	5:{
		"C" 	:	523.251130601197269,
		"C#" 	: 	554.365261953744192,
		"D" 	:	587.32953583481512,
		"D#"	: 	622.253967444161821,
		"E" 	:	659.255113825739859,
		"F" 	:	698.456462866007768,
		"F#" 	: 	739.988845423268797,
		"G" 	:	783.990871963498588,
		"G#"	: 	830.609395159890277,
		"A" 	:	880.0,
		"A#" 	: 	932.327523036179832,
		"B" 	:	987.766602512248223,
	},
	6:{
		"C" 	: 	1046.502261202394538,
		"C#" 	:  	1108.730523907488384,
		"D" 	: 	1174.659071669630241,
		"D#"	:  	1244.507934888323642,
		"E" 	: 	1318.510227651479718,
		"F" 	: 	1396.912925732015537,
		"F#" 	:  	1479.977690846537595,
		"G" 	: 	1567.981743926997176,
		"G#"	:  	1661.218790319780554,
		"A" 	: 	1760.0,
		"A#" 	:  	1864.655046072359665,
		"B" 	: 	1975.533205024496447,
	},
	7:{
		"C" 	: 	2093.004522404789077,
		"C#" 	: 	2217.461047814976769,
		"D" 	: 	2349.318143339260482,
		"D#"	:	2489.015869776647285,
		"E" 	: 	2637.020455302959437,
		"F" 	: 	2793.825851464031075,
		"F#" 	: 	2959.955381693075191,
		"G" 	: 	3135.963487853994352,
		"G#"	: 	3322.437580639561108,
		"A" 	: 	3520.000000000000000,
		"A#" 	: 	3729.310092144719331,
		"B" 	: 	3951.066410048992894,
		"C"		:	4186.009044809578154
	},
};


function createNoteTable() {
	const noteFreq = [];
	for (let i=0; i< 9; i++) {
		noteFreq[i] = [];
	}
	return noteFreq;
}

if (!Object.entries) {
	Object.entries = function entries(O) {
		return reduce(
			keys(O),
			(e, k) => concat(
				e,
				typeof k === "string" && isEnumerable(O, k) ? [[k, O[k]]] : [],
			),
			[],
		);
	};
}
function createKey(note, octave, freq) {
	const keyElement = document.createElement("div");
	keyElement.className = "key";
	keyElement.dataset["octave"] = octave;
	keyElement.dataset["note"] = note;
	keyElement.dataset["frequency"] = freq;

	const labelElement = document.createElement("div");

	labelElement.innerHTML = `${note}<sub>${octave}</sub>`;
	keyElement.appendChild(labelElement);

	keyElement.addEventListener("mousedown", notePressed, false);
	keyElement.addEventListener("mouseover", notePressed, false);

	return keyElement;
}

// TODO: create only one octave at a time
function setup() {
	// volumeControl.addEventListener("change", changeVolume, false);
  	// globalGain.gain.value = volumeControl.value;
	noteFreq = createNoteTable();
  
	// Create the keys; skip any that are sharp or flat; for
	// our purposes we don't need them. Each octave is inserted
	// into a <div> of class "octave".
	noteFreq.forEach((keys, idx) => {
		const keyList = Object.entries(keys);
		const octaveElem = document.createElement("div");
		octaveElem.className = "octave";

		keyList.forEach((key) => {
			if (key[0].length === 1) {
				octaveElem.appendChild(createKey(key[0], idx, key[1]));
			}
		});
		document.getElementById("digital_keyboard").appendChild(octaveElem);
	});
}

function initAM() {
    var carrier = audioCtx.createOscillator();
    var modulatorFreq = audioCtx.createOscillator();
    modulatorFreq.frequency.value = 100;
    carrier.frequency.value = 440;

    const modulated = audioCtx.createGain();
    const depth = audioCtx.createGain();
    depth.gain.value = 0.5 //scale modulator output to [-0.5, 0.5]
    modulated.gain.value = 1.0 - depth.gain.value; //a fixed value of 0.5

    modulatorFreq.connect(depth).connect(modulated.gain); //.connect is additive, so with [-0.5,0.5] and 0.5, the modulated signal now has output gain at [0,1]
    carrier.connect(modulated)
    modulated.connect(audioCtx.destination);
    
    carrier.start();
    modulatorFreq.start();

}
 
  
window.onload = function(event) {
	audioCtx = new (window.AudioContext || window.webkitAudioContext);
	var globalGain = audioCtx.createGain(); //this will control the volume of all notes
	globalGain.gain.setValueAtTime(0.8, audioCtx.currentTime);
	globalGain.connect(audioCtx.destination);

	var volumeControl = document.querySelector("input[name='volume']");
	globalGain.gain.value = volumeControl.value;
	
	var sineTerms = new Float32Array([0, 0, 1, 0, 1]);
	var cosineTerms = new Float32Array(sineTerms.length);
	var customWaveform = audioCtx.createPeriodicWave(cosineTerms, sineTerms);
}
  
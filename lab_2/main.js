const wavePicker = document.querySelector("select[name='waveform']");
var oscList;


function playTone(freq) {
	const osc = audioCtx.createOscillator();
	osc.connect(globalGain);
  
	const type = wavePicker.options[wavePicker.selectedIndex].value;
  
	if (type === "custom") {
	  osc.setPeriodicWave(customWaveform);
	} else {
	  osc.type = type;
	}
  
	osc.frequency.value = freq;
	osc.start();
  
	return osc;
}
  
function sleep(ms){
	return new Promise(resolve => setTimeout(resolve, ms));
}
  
async function notePressed(event) {
	if (event.buttons & 1) {
		const dataset = event.target.dataset;

		if (!dataset["pressed"] && dataset["octave"]) {
		const octave = Number(dataset["octave"]);
		oscList[octave][dataset["note"]] = playTone(dataset["frequency"]);
		dataset["pressed"] = "yes";
		console.log("setTimeout")
		await sleep(Math.floor(Math.random()*6000)+1);

		oscList[octave][dataset["note"]].stop();
		delete oscList[octave][dataset["note"]];
		delete dataset["pressed"];
		}
	}
}
//TODO: add NoteReleased
//TODO: add Pedals function


function changeVolume(event) {
	globalGain.gain.value = volumeControl.value;
}

// TODO: Update keys
const synthKeys = document.querySelectorAll(".key");
const keyCodes = [
	"Space",
	"ShiftLeft", "KeyZ", "KeyX", "KeyC", "KeyV", "KeyB", "KeyN", "KeyM", "Comma", "Period", "Slash", "ShiftRight",
	"KeyA", "KeyS", "KeyD", "KeyF", "KeyG", "KeyH", "KeyJ", "KeyK", "KeyL", "Semicolon", "Quote", "Enter",
	"Tab", "KeyQ", "KeyW", "KeyE", "KeyR", "KeyT", "KeyY", "KeyU", "KeyI", "KeyO", "KeyP", "BracketLeft", "BracketRight",
	"Digit1", "Digit2", "Digit3", "Digit4", "Digit5", "Digit6", "Digit7", "Digit8", "Digit9", "Digit0", "Minus", "Equal", "Backspace",
	"Escape",
];

function keyNote(event) {
const elKey = synthKeys[keyCodes.indexOf(event.code)];
if (elKey) {
	if (event.type === "keydown") {
	elKey.tabIndex = -1;
	elKey.focus();
	elKey.classList.add("active");
	notePressed({ buttons: 1, target: elKey });
	} else {
	elKey.classList.remove("active");
	noteReleased({ buttons: 1, target: elKey });
	}
	event.preventDefault();
}
}
addEventListener("keydown", keyNote);
addEventListener("keyup", keyNote);
  
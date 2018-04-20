import {eventToString} from "./events.js";
import Rx from "rxjs/Rx";

function log(msg) {
    document.getElementById("events").prepend(msg + "\n");
}

function logWebMidiEvent(e) {
    console.log("logWebMidiEvent", e);
    log(eventToString(e));
}

function logWebMidiMessage(e) {
    console.log("logWebMidiMessage", e);
    document.getElementById("messages").prepend(eventToString(e) + "\n");
}

var midi = null;  // global MIDIAccess object
var connectedInputs = [];   // array of IDs

// function subscribeInputs(midiAccess) {
//     var inputs = midiAccess.inputs.values();
//     // loop over all available inputs
//     for (var input = inputs.next(); input && !input.done; input = inputs.next()) {
//         input.value.onmidimessage = handleMessage;
//     }
// }

// function handleMessage(event) {
//     console.log("handleMessage", event);
//
//     if (event instanceof MIDIMessageEvent) {
//
//         /** @type Uint8Array */
//         var bytes = event.data;
//         var channel = bytes[0] & 0x0F;      // The MIDI channel
//         var type = bytes[0] & 0xF0;         // The MIDI event type
//         var port = event.currentTarget;
//         /*
//         if (type === 0x90) {
//             handleNoteOn(bytes[1], bytes[2]);
//         } else if (type === 0x80) {
//             handleNoteOff(bytes[1], bytes[2]);
//         }
//         */
//         logWebMidiMessage(event.type + ': ' + port.type + ' ' + port.name + ' chan:' + channel + ' type:' + type + ' data:' + bytes);
//     } else {
//         logWebMidiMessage(event.type + ': ' + event.data);
//     }
// }

function listInputsAndOutputs(midiAccess) {

    let inputs = [];
    let iter = midiAccess.inputs.values();
    for (let o = iter.next(); !o.done; o = iter.next()) {
        inputs.push(o.value);
    }

    for (let port = 0; port < inputs.length; port++) {
        let i = inputs[port];
        logWebMidiEvent(i.type + ' id:' + i.id.substring(0, 6) + "..." + ' "' + i.name);
    }
}

function connectInput() {
    for (let entry of midi.inputs) {
        let i = entry[1];
        console.log("connectInput", i);
        if (i.type === "input" && i.name.includes("VMPK")) {
            if (connectedInputs.includes(i.id)) {
                logWebMidiEvent(`! input "${i.name}" already connected`);
            } else {
                logWebMidiEvent(`+ connect input "${i.name}"`);
                connectedInputs.push(i.id);
            }
        }
    }
    console.log("connectInput: connectedInputs", connectedInputs);
}

function disconnectInput(id) {
    connectedInputs = connectedInputs.filter(element => element !== id)
    console.log("disconnectInput: connectedInputs", connectedInputs);
}

function handleStateChange(event) {
    console.log("handleStateChange", event);
    let p = event.port; // @type (MIDIInput|MIDIOutput)
    logWebMidiEvent('state change: ' + p.type + ' "' + p.name + '": ' + p.state);
    if (p.state === "connected") {
        logWebMidiEvent('port connection: ' + p.type + ' "' + p.name + '"');
        connectInput();
    } else if (p.state === "disconnected") {
        logWebMidiEvent('port disconnection: ' + p.type + ' "' + p.name + '"');
        disconnectInput(p.id);
    } else {
        logWebMidiEvent('port ' + p.type + ' "' + p.name + '" is in an unknown state: ' + p.state );
    }
    listInputsAndOutputs(midi);
}

function onMIDISuccess(midiAccess) {
    logWebMidiEvent("Got access to MIDI");
    midi = midiAccess;
    midi.onstatechange = handleStateChange;
    listInputsAndOutputs(midi);
    connectInput();
    // subscribeInputs(midi);
}

function onMIDIFailure(msg) {
    logWebMidiEvent("onMIDIFailure");
    logWebMidiEvent("Failed to get MIDI access - " + msg);
}

document.addEventListener("DOMContentLoaded", function(event) {

    console.log("events-rxjs-w3cmidi starting...");

    navigator.requestMIDIAccess({ sysex: true }).then(onMIDISuccess, onMIDIFailure);

});

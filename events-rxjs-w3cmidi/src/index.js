import {eventToString} from "./events.js";
import Rx from "rxjs/Rx";

const INPUT_NAME = "VMPK";      // linux Virtual Midi Piano Keyboard

var midi = null;  // global MIDIAccess object
var connectedInputs = [];   // array of IDs



function log(msg) {
    document.getElementById("events").prepend(msg + "\n");
}

function logWebMidiEvent(e) {
    console.log("logWebMidiEvent", e);
    log(eventToString(e));
}

function logWebMidiMessage(e) {
    // console.log("logWebMidiMessage", e);
    document.getElementById("messages").prepend(eventToString(e) + "\n");
}

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



//
// e.g.: createObservable(input, 'onmidimessage');
//
const createObservable = (port, handlerName) => (

    // public static create(onSubscription: function(observer: Observer): TeardownLogic): Observable
    // Creates a new Observable, that will execute the specified function when an Observer subscribes to it.

    // `create` converts an onSubscription function to an actual Observable.

    // Whenever someone subscribes to that Observable, the function will be called with an Observer instance as
    // a first and only parameter. onSubscription should then invoke the Observers next, error and complete methods.

    Rx.Observable.create(

        // onSubscription: function(observer: Observer) :
        observer => {

            if (port.observers === undefined) {

                port.observers = [];

                // event handler callback definition:
                port[handlerName] = event => {
                    port.observers.forEach(obs => {
                        // the callback calls next():
                        obs.next(event);                // Calling next with a value will emit that value to the observer.
                    });
                };

            }

            port.observers.push(observer);

            // onSubscription can optionally return either a function or an object with unsubscribe method.
            // In both cases function or method will be called when subscription to Observable is being cancelled and
            // should be used to clean up all resources.

            return () => {
                console.log("port observable unsubscribe");
                port.observers = port.observers.filter(x => x !== observer);
            };

            // return Rx.Disposable.create(() => {
            //     port.observers = port.observers.filter(x => x !== observer);
            // });

        } // observer()

    ) // create()

);

var consumer;       //TODO: put in connectedInputs array

function connectInput() {
    for (let entry of midi.inputs) {
        let i = entry[1];
        console.log("connectInput", i);
        if (i.type === "input" && i.name.includes(INPUT_NAME)) {
            if (connectedInputs.includes(i.id)) {
                logWebMidiEvent(`! input "${i.name}" already connected`);
            } else {
                logWebMidiEvent(`+ connect input "${i.name}" "${i.id}"`);
                connectedInputs.push(i.id);

                // const inputStream = createObservable(i, "onmidimessage");
                // consumer = inputStream.subscribe(message => {
                consumer = createObservable(i, "onmidimessage").subscribe(message => {
                    console.log(message);
                    logWebMidiMessage(message);
                });

            }
        }
    }
    console.log("connectInput: connectedInputs", connectedInputs);
}

function disconnectInput(id) {
    if (connectedInputs.includes(id)) {
        logWebMidiEvent(`+ disconnect input "${id}"`);
        connectedInputs = connectedInputs.filter(element => element !== id);
        if (consumer) {
            consumer.unsubscribe();
        }
    }
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

    // const logDb = new PouchDB("midi-log");

    navigator.requestMIDIAccess({ sysex: true }).then(onMIDISuccess, onMIDIFailure);

});

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
                port.observers = port.observers.filter(x => x !== observer);
            };

            // return Rx.Disposable.create(() => {
            //     port.observers = port.observers.filter(x => x !== observer);
            // });

        } // observer()

    ) // create()

);

document.addEventListener("DOMContentLoaded", function(event) {

    console.log("events-rxjs-w3cmidi starting...");

    // const inputStream = Rx.Observable.fromPromise(navigator.requestMIDIAccess())
    //     .map(midi => midi.inputs.values().next().value)
    //     .flatMap(input => midimessageAsObservable(input))
    //     .map(message => parseEvent(message));
    //
    // inputStream.subscribe(message => console.log(message));

    Rx.Observable.fromPromise(navigator.requestMIDIAccess())
        .map(midi => {
            // Select first available input
            return midi.inputs.values().next().value;
        })
        // Filter items emitted by the source Observable by only emitting those that satisfy a specified predicate.
        // .filter(midi => {
        //     return midi.inputs.values().next().value;
        // })
        .flatMap(input => {
            // Get stream of messages
            //return midimessageAsObservable(input);
            return createObservable(input, "onmidimessage");
        })
        .subscribe(message => {
            // Output the message
            console.log(`${message.timeStamp} ${message.data}`);
        });

    // https://stackoverflow.com/questions/33527653/babel-6-regeneratorruntime-is-not-defined
    /*
    (async function() {

        const MIDI = { inputs: [], outputs: [] };

        async function startMIDIAccess() {
            try {
                let access = await navigator.requestMIDIAccess({sysex:false});
                let iItr = access.inputs.values(), oItr = access.outputs.values();
                for(let i=iItr.next(); !i.done; i=iItr.next()) MIDI.inputs.push(i.value);
                for(let o=oItr.next(); !o.done; o=iItr.next()) MIDI.outputs.push(o.value);
                return true;
            } catch(error) {
                console.error('[ERROR] requestMIDIAccess()', error);
                return false;
            }
        }

        console.log(MIDI);

    }());
    */

    /*
    var midiInput;

    navigator.requestMIDIAccess().then(midiAccess => {

        // Get first available midi input device
        // midiInput = midiAccess.inputs.values().next().value;

        for (var i of midiAccess.inputs.values()) {
            console.log(i);
            if (i.type === "input" && i.name.includes("VMPK")) {
                midiInput = i;
                break;
            }
        }

        console.log(midiInput);

        // // Set a handler that outputs the incoming message
        // firstInput.onmidimessage = function(event) {
        //     console.log(parseEvent(event));
        // };

    });
    */

});

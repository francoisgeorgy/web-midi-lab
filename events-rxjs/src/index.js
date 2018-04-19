import WebMidi from "webmidi";
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

document.addEventListener("DOMContentLoaded", function(event) {

    // var noteOnSub;

    function noteOnListener(e) {
        // console.log(noteOnListener);
        // var event = new CustomEvent('midinoteon', e);
        document.body.dispatchEvent(new CustomEvent('custommidinoteon', {
            detail: {
                midi: e
            }
        }));
    }

    WebMidi.enable(function (err) {

        if (err) alert("WebMidi could not be enabled.", err);

        console.log("web midi enabled");
        log("web midi enabled");

        WebMidi.inputs.map(i => log("input:" + i.name));
        WebMidi.outputs.map(i => log("output:" + i.name));

        WebMidi.addListener("connected", e => {
            console.log(`${e.port.name} connected`);
            // logWebMidiEvent(e);
            // connect:
            if (e.port.type === "input" && e.port.name.includes("VMPK") > 0) {  //TODO: do only for one specific device
                // console.log("input port: add events handlers");

                if (e.port.hasListener('noteon', 'all', noteOnListener)) {
                    console.log(`${e.port.name} already has a listener`);
                } else {
                    e.port.addListener('noteon', 'all', noteOnListener);
                    console.log(`${e.port.name} listener added`);

                    //note: make sure to instanciate this only once:
                    const noteOnSub = Rx.Observable.fromEvent(document.body, "custommidinoteon").subscribe((e) => {
                        // e.stopPropagation();
                        console.log(`midi noteon ${e.detail.midi.target.name} ${e.detail.midi.timestamp}`, e)
                    });
                }

            }
        });
        WebMidi.addListener("disconnected", e => {
            console.log(`${e.port.name} disconnected`);
            // logWebMidiEvent(e);
            if (e.port.type === "input") {
                // console.log("input port: remove events handlers");
                console.log(`${e.port.name} listener removed`);
            }
        });

    });

});

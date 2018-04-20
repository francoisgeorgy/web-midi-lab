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

                // if (e.port.hasListener('noteon', 'all', noteOnListener)) {
                //     console.log(`${e.port.name} already has a listener`);
                // } else {

                    // FIXME: event handlers are not cleared correctly between page reloads

                    e.port.removeListener();

                    e.port.addListener('noteon', 'all', e => {
                        document.body.dispatchEvent(new CustomEvent("midiNotOn", { detail: e }))
                    });
                    console.log(`${e.port.name} listener added`);

                    //note: make sure to instanciate this only once:
                    const noteOnSub = Rx.Observable.fromEvent(document.body, "midiNotOn").subscribe((e) => {
                        // e.stopPropagation();
                        console.log(`midi noteon ${e.detail.target.name} ${e.detail.timestamp}`, e)
                    });
                // }

            }
        });
        WebMidi.addListener("disconnected", e => {
            console.log(`${e.port.name} disconnected`);
            // logWebMidiEvent(e);

            //note: disconnection will remove all listeners

            // if (e.port.type === "input") {
            //     console.log(`remove listener for ${e.port.name}`, e);
            //     e.port.removeListener();
            //     console.log(`${e.port.name} listener removed`);
            // }
        });

    });

});

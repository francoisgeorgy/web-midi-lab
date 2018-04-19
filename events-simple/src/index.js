import WebMidi from "webmidi";
import {eventToString} from "./events.js";

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
            console.log("connected", e);
            logWebMidiEvent(e);
            // connect:
            if (e.port.type === "input") {
                console.log("input port: add events handlers");
                if (e.port.hasListener('noteon', 'all', logWebMidiMessage)) {
                    console.log(`connectInput: input ${e.port.id} already has a listener`);
                } else {
                    e.port.addListener('noteon', 'all', logWebMidiMessage);
                    console.log(`connectInput : input ${e.port.id} connected`);
                }
            }
        });
        WebMidi.addListener("disconnected", e => {
            console.log("disconnected", e);
            logWebMidiEvent(e);
            if (e.port.type === "input") {
                console.log("input port: remove events handlers");
            }
        });

    });

});

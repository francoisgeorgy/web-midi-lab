import WebMidi from "webmidi";

function portFromId(id) {
    let p = WebMidi.inputs.find(item => item.id === id);
    // console.log(`portFromId(${id})`, p, WebMidi.inputs);
    if (p) {
        return p;
    } else {
        return WebMidi.outputs.find(item => item.id === id);
    }
}

function inputFromId(id) {
    // console.log(`inputById(${id})`, WebMidi.inputs);
    return WebMidi.inputs.find(item => item.id === id);
}

/**
 * Return webmidi input name from input id
 * @param id
 */
function inputName(id) {
    // console.log(`inputName(${id})`, WebMidi.inputs);
    let i = WebMidi.inputs.find(item => item.id === id);
    return i ? i.name : null;
}

export {
    portFromId,
    inputFromId,
    inputName
}

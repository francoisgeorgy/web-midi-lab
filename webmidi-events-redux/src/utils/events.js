
// We try to distinguish between global events (device connection/disconnection) and device events (e.g. noteon)
// by looking at the event's properties.
// At the moment, we only distinguish "port" events and "input" events.

function portEventToString(event) {
    // console.log("port event", event);
    return `${event.timestamp.toFixed(3)} ${event.type} ${event.port.type} ${event.port.name} ${event.port.id}`;
}

function inputEventToString(event) {
    // console.log("input event", event);
    return `${event.timestamp.toFixed(3)} ${event.type} on channel ${event.channel} of ${event.target.name}`;
}

function eventToString(event) {
    if ((typeof event === 'undefined') || (event === null)) {
        console.log("eventToString: return empty string", event);
        return "";
    }
    if (event.hasOwnProperty("port")) {
        return portEventToString(event);
    } else {
        return inputEventToString(event);
    }
}

function portEventUniqueID(event) {
    return `${event.timestamp}-${event.port.id}`;
}

function inputEventUniqueID(event) {
    return `${event.timestamp}-${event.target.id}`;
}

function eventUniqueID(event) {
    if ((typeof event === 'undefined') || (event === null)) {
        console.log("eventToString: return empty string", event);
        return "";
    }
    if (event.hasOwnProperty("port")) {
        return portEventUniqueID(event);
    } else {
        return inputEventUniqueID(event);
    }
}

export {
    eventToString,
    eventUniqueID
}


// We try to distinguish between global events (device connection/disconnection) and device events (e.g. noteon)
// by looking at the event's properties.
// At the moment, we only distinguish "port" events and "input" events.

function isConnectEvent(event) {
    return event && event.type && (event.type === 'connected');
}

function isDisconnectEvent(event) {
    return event && event.type && (event.type === 'disconnected');
}

function portEventToString(event) {
    // console.log("port event", event);
    //return `${event.timestamp.toFixed(3)} ${event.type} ${event.port.type} ${event.port.name} ${event.port.id}`;
    // return `${event.timestamp.toFixed(3)} ${event.type} ${event.port.type} "${event.port.name}" (connection ${event.port.connection}) (id ...${event.port.id.substr(event.port.id.length - 8)})`;

    return `${event.timestamp.toFixed(3)} ${event.type} ${event.port.type} "${event.port.name}" (id ...${event.port.id.substr(event.port.id.length - 8)})`;
}

function inputEventToString(event) {
    // console.log("input event", event);
    return `${event.timestamp.toFixed(3)} ${event.type} on channel ${event.channel} of ${event.target.name}`;
}

function inputW3EventToString(event) {
    // console.log("inputW3EventToString input event", event);
    return `${event.timeStamp.toFixed(3)} ${event.type} ${event.data} of ${event.target.name}`;
}

function eventToString(event) {
    if ((typeof event === "undefined") || (event === null)) {
        console.log("eventToString: return empty string", event);
        return "";
    }
    if (typeof event === "string") {
        return event;
    } else if (event instanceof MIDIMessageEvent) {
        return inputW3EventToString(event);
    } else if (event.hasOwnProperty("port")) {
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
    isConnectEvent,
    isDisconnectEvent,
    eventToString,
    eventUniqueID
}

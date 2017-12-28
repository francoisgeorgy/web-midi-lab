import React, {Component} from 'react';
import './App.css';
import WebMidi from '../node_modules/webmidi';
import PropTypes from 'prop-types';

/**
 * Return webmidi input name from input id
 * @param id
 */
function inputName(id) {
    // console.log(`inputName(${id})`, WebMidi.inputs);
    let i = WebMidi.inputs.find(item => item.id === id);
    return i ? i.name : null;
}

function inputById(id) {
    // console.log(`inputById(${id})`, WebMidi.inputs);
    return WebMidi.inputs.find(item => item.id === id);
}

/**
 * Render a single midi connection
 * @param c
 * @returns {*}
 */
function connection(c, props) {
    switch (c.type) {
        case 'input':
            // console.log('input', props);
            return (
                <div>
                    <label>
                        <input type="checkbox" onClick={() => props.handleInputSelect(c.id)} />
                    </label>
                    <b>{c.name}</b>: {c.type} {c.connection} {c.state} "{c.manufacturer}" {c.id}
                </div>
            );
        case 'output':
            return (
                <div>
                    <b>{c.name}</b>: {c.type} {c.connection} {c.state} "{c.manufacturer}" {c.id}
                </div>
            );
        default:
            return (
                <div>ERROR: unknown type: {c.type}</div>
            );
    }
}

/**
 * Render a group of midi connections
 * @param props
 * @returns {*}
 * @constructor
 */
function Connections(props) {
    console.log("render <Connections>", props.connections);
    if (!props.connections) return <div></div>;
    return (
        <div>
            <ul>
                {props.connections.map(i => <li key={i.id}>{connection(i, props)}</li>)}
            </ul>
        </div>
    );
}

function Connected(props) {
    console.log("render <Connected>", props.ins);
    if (!props.ins || props.ins.length===0) return <div></div>;
    return (
        <div>
            <h4>connected inputs:</h4>
            <ul>
                {props.ins.map(i => <li key={i}>{inputName(i)}</li>)}
            </ul>
        </div>
    );
}

/**
 * Render the N last midi events
 * @param props
 * @constructor
 */
function PortEvents(props) {
    console.log("render <PortEvents>", props.events);

    //TODO: can the timestamp be used as a _unique_ key in the iterator below? If not unique --> create a unique key with timestamp+id.

    let n = Math.min(props.count || 0, props.events.length);
    return (
        <div>
            {props.events.slice(-n).reverse().map(e => <div key={e.timestamp}>[{e.timestamp.toFixed(6)}] {e.type} {e.port.type} {e.port.name} {e.port.id}</div>)}
        </div>
    );
}

PortEvents.propTypes = {
    count: PropTypes.number,
    events: PropTypes.array.isRequired
};

/**
 * Render the N last input events
 * @param props
 * @constructor
 */
function InputEvents(props) {
    console.log("render <InputEvents>", props.events);

    //TODO: can the timestamp be used as a _unique_ key in the iterator below? If not unique --> create a unique key with timestamp+id.

    let n = Math.min(props.count || 0, props.events.length);
    return (
        <div>
            {props.events.slice(-n).reverse().map(e => <div key={e.timestamp}>[{e.timestamp.toFixed(6)}] {e.type}</div>)}
        </div>
    );
}

InputEvents.propTypes = {
    count: PropTypes.number,
    events: PropTypes.array.isRequired
};

class App extends Component {

    state = {
        // inputs: null,    // no need to store inputs or outputs in the state because WebMidi object is globally accessible.
        // outputs: null,
        events: [],         // bad for performance but good enough for this test app.       TODO: replace by a buffer (FIFO)
        inputEvents: [],         // bad for performance but good enough for this test app.  TODO: replace by a buffer (FIFO)
        ins: []             // ids of inputs we listen to
    };

    constructor(props) {
        super(props);
        this.midiOn = this.midiOn.bind(this);
        // this.handleMidiState = this.handleMidiState.bind(this);
        this.handleMidiEvent = this.handleMidiEvent.bind(this);
        this.handleMidiInputEvent = this.handleMidiInputEvent.bind(this);
        this.handleInputSelect = this.handleInputSelect.bind(this);
    }

    // Not needed. We can directly access the inputs and outputs through the global WebMidi object.
    // handleMidiState() {
    //     this.setState({inputs: WebMidi.inputs, outputs: WebMidi.outputs})
    // }

    handleMidiEvent(e) {
        console.group(`handleMidiEvent: ${e.port.constructor.name} ${e.type}: ${e.port.name}`, e);

        // is disconnect event, remove the existing input listeners
        if (e.type === "disconnected") {
            console.log(`must disconnect ${e.port} ${e.port.id}`);
            this.disconnectInput(e.port.id);
        }

        // Note: if we don't display the events, than the UI will not be updated if we don't update the state.
        //       In that case we should call forceUpdate().
        //       More info in README.md.

        // We store all the events in order to display them.
        // In a real app, only store the last event per port and type.
        console.log('add event to state.events');
        this.setState({ events: [...this.state.events, e]})

        // this.handleMidiState();
        console.groupEnd();
    }

    handleMidiInputEvent(e) {
        console.log('handleMidiInputEvent', e);

        // We store all the events in order to display them.
        // In a real app, only store the last event per port and type.
        console.log('add event to state.inputEvents');
        this.setState({ inputEvents: [...this.state.inputEvents, e]})

        // this.handleMidiState();
    }

    connectInput(id) {
        const i = inputById(id);
        if (i) {
            i.addListener('noteon', 'all', this.handleMidiInputEvent);
            console.log(`connectInput: input ${id} connected`);
        } else {
            console.log(`connectInput: input ${id} not found`);
        }
        console.log('add input to state.ins');
        this.setState({ins: [...this.state.ins, id]});
    }

    disconnectInput(id) {
        const i = inputById(id);
        if (i) {
            i.removeListener();
            console.log(`disconnectInput: input ${id} disconnected`);
        } else {
            console.log(`disconnectInput: input ${id} not found`);
        }
        let current = this.state.ins;
        current.splice(current.indexOf(id), 1);
        console.log('remove input from state.ins');
        this.setState({ins: current});
    }

    handleInputSelect(id) {
        console.group('handleInputSelect', id);
        if (this.state.ins.includes(id)) {
            this.disconnectInput(id);
        } else {
            this.connectInput(id)
        }
        console.groupEnd();
    }

    midiOn(err) {
        if (err) {
            console.log("WebMidi could not be enabled.", err);
        } else {
            console.log("WebMidi enabled!");
            console.log("WebMidi inputs", WebMidi.inputs);
            console.log("WebMidi outputs", WebMidi.outputs);
            // WebMidi.inputs.map(i => console.log("found input:" + i.name, i));     // debug
            // WebMidi.outputs.map(i => console.log("found output:" + i.name, i));   // debug
            WebMidi.addListener("connected", this.handleMidiEvent);
            WebMidi.addListener("disconnected", this.handleMidiEvent);
            // this.handleMidiState();
        }
    }

    componentDidMount() {
        console.log('App.componentDidMount');
        WebMidi.enable(this.midiOn);
    }

    render() {
        return (
            <div className="App">

                <h2>Events:</h2>
                <PortEvents events={this.state.events} count={10} />

                <h2>Inputs:</h2>
                <Connections connections={WebMidi.inputs} handleInputSelect={this.handleInputSelect} />
                <Connected ins={this.state.ins} />
                <InputEvents events={this.state.inputEvents} count={10} />

                <h2>Outputs:</h2>
                <Connections connections={WebMidi.outputs} />
{/*
                <h3>State Inputs:</h3>
                <Connections connections={this.state.inputs} />
                <h3>State Outputs:</h3>
                <Connections connections={this.state.outputs} />
                <hr />
*/}
                {/* Using the global webmidi object instead of using a state-saved copy of the inputs and outputs: */}
            </div>
        );
    }

}

export default App;

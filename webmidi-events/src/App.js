import React, {Component} from 'react';
import './App.css';
import WebMidi from '../node_modules/webmidi';
import PropTypes from 'prop-types';
import {eventToString, eventUniqueID} from "./utils/events";

function ChannelSelect() {
    return (
        <div>
            listen on channel:
            <label><input type="checkbox" value="all" />all</label>
            {[...Array(16)].map((v, i) =>
            <label><input type="checkbox" value={i+1} />{i+1}</label>
            )}
        </div>
    );
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
            let select = '';
            if (props.connectedInputs &&
                props.connectedInputs.length > 0 &&
                props.connectedInputs.includes(c.id)) {
                select = <ChannelSelect/>;
            }
            return (
                <div>
                    <label>
                        <input type="checkbox" onClick={() => props.handleSelection(c.id)} />
                    </label>
                    <b>{c.name}</b>: {c.type} {c.connection} {c.state} "{c.manufacturer}" {c.id}
                    {select}
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
function Ports(props) {
    console.log("render <Connections>", props.ports);
    if (!props.ports) return <div></div>;
    return (
        <div>
            <ul>
                {props.ports.map(i => <li key={i.id}>{connection(i, props)}</li>)}
            </ul>
        </div>
    );
}

function ConnectedInputs(props) {
    console.log("render <Connected>", props.connectedInputs);
    if (!props.connectedInputs || props.connectedInputs.length===0) return <div></div>;
    return (
        <div>
            <h4>connected inputs:</h4>
            <ul>
                {props.connectedInputs.map(i => <li key={i}>{inputName(i)}</li>)}
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
    let n = Math.min(props.count || 0, props.events.length);
    return (
        <div>
            {props.events.slice(-n).reverse().map(e => <div key={eventUniqueID(e)}>{eventToString(e)}</div>)}
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
    let n = Math.min(props.count || 0, props.events.length);
    return (
        <div>
            {props.events.slice(-n).reverse().map(e => <div key={eventUniqueID(e)}>{eventToString(e)}</div>)}
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
        connectedInputs: []             // ids of inputs we listen to
    };

    constructor(props) {
        super(props);
        this.midiOn = this.midiOn.bind(this);
        // this.handleMidiState = this.handleMidiState.bind(this);
        this.handleMidiEvent = this.handleMidiEvent.bind(this);
        this.handleMidiInputEvent = this.handleMidiInputEvent.bind(this);
        this.handleSelection = this.handleSelection.bind(this);
    }

    // Not needed. We can directly access the inputs and outputs through the global WebMidi object.
    // handleMidiState() {
    //     this.setState({inputs: WebMidi.inputs, outputs: WebMidi.outputs})
    // }

    handleMidiEvent(e) {
        console.group(`handleMidiEvent: ${e.port.constructor.name} ${e.type}: ${e.port.name}`, e);


        // console.log(eventToString(e));


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

        // console.log(eventToString(e));

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
        console.log('add input to state.connectedInputs');
        this.setState({connectedInputs: [...this.state.connectedInputs, id]});
    }

    disconnectInput(id) {
        const i = inputById(id);
        if (i) {
            i.removeListener();
            console.log(`disconnectInput: input ${id} disconnected`);
        } else {
            console.log(`disconnectInput: input ${id} not found`);
        }
        let current = this.state.connectedInputs;
        current.splice(current.indexOf(id), 1);     // remove id from array
        console.log('remove input from state.connectedInputs');
        this.setState({connectedInputs: current});
    }

    handleSelection(id) {
        console.group('handleSelection', id);
        if (this.state.connectedInputs.includes(id)) {
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
                <Ports ports={WebMidi.inputs} connectedInputs={this.state.connectedInputs} handleSelection={this.handleSelection} />

                <ConnectedInputs connectedInputs={this.state.connectedInputs} />
                <InputEvents events={this.state.inputEvents} count={10} />

                <h2>Outputs:</h2>
                <Ports ports={WebMidi.outputs} />
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

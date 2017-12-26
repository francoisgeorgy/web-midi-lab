import React, {Component} from 'react';
import './App.css';
import WebMidi from '../node_modules/webmidi';
import PropTypes from 'prop-types';

/**
 * Render a single midi connection
 * @param c
 * @returns {*}
 */
function connection(c) {
    return (
        <div>
            <b>{c.name}</b>: {c.type} {c.connection} {c.state} "{c.manufacturer}" {c.id}
        </div>
    );
}

/**
 * Render a group of midi connections
 * @param props
 * @returns {*}
 * @constructor
 */
function Connections(props) {
    console.log(props.connections);
    if (!props.connections) return <div></div>;
    return (
        <div>
            <ul>
                {props.connections.map(i => <li key={i.id}>{connection(i)}</li>)}
            </ul>
        </div>
    );
}

/**
 * Render the N last midi events
 * @param props
 * @constructor
 */
function Events(props) {
    console.log(props.events, props.count, props.events.slice(-1));
    let n = Math.min(props.count || 0, props.events.length);
    return (
        <div>
            {props.events.slice(-n).reverse().map(e => <div>[{e.timestamp.toFixed(6)}] {e.type} {e.port.type} {e.port.name} {e.port.id}</div>)}
        </div>
    );
}

Events.propTypes = {
    count: PropTypes.number,
    events: PropTypes.array.isRequired
};

class App extends Component {

    state = {
        // inputs: null,    // no need to store inputs or outputs in the state because WebMidi object is globally accessible.
        // outputs: null,
        events: []      // bad for performance but good enough for this test app.
    };

    constructor(props) {
        super(props);
        this.midiOn = this.midiOn.bind(this);
        // this.handleMidiState = this.handleMidiState.bind(this);
        this.handleMidiEvent = this.handleMidiEvent.bind(this);
    }

    // Not needed. We can directly access the inputs and outputs through the global WebMidi object.
    // handleMidiState() {
    //     this.setState({inputs: WebMidi.inputs, outputs: WebMidi.outputs})
    // }

    handleMidiEvent(e) {
        console.log('handleMidiEvent', e);

        // We store all the events in order to display them.
        // In a real app, only store the last event per port and type.
        this.setState({ events: [...this.state.events, e]})

        // this.handleMidiState();
    }

    midiOn(err) {
        if (err) {
            console.log("WebMidi could not be enabled.", err);
        } else {
            console.log("WebMidi enabled!");
            WebMidi.inputs.map(i => console.log("input:" + i.name, i));     // debug
            WebMidi.outputs.map(i => console.log("output:" + i.name, i));   // debug
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
                <Events events={this.state.events} count={10} />
                <h2>Inputs:</h2>
                <Connections connections={WebMidi.inputs} />
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

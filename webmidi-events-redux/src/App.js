import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {createStore} from "redux";
import {Provider, connect} from 'react-redux';
import './App.css';
import WebMidi from '../node_modules/webmidi';
import {eventToString, eventUniqueID} from "./utils/events";
import Ports from "./components/Ports";
import PortEvents from "./components/PortEvents";

// redux action creators
function addId(id) {
    return {type: 'ADD_ID', id};
}
function addEvent(event) {
    console.log('add event');
    return {type: 'ADD_EVENT', event};
}
function addInputEvent(event) {
    return {type: 'ADD_INPUT_EVENT', event};
}

// REDUCER
// A reducer takes the current state and returns a new state depending on the action.
// The state can never be undefined so you should always give it a default state
// and always return some sort of state (never undefined).

const initialState = {
    events: [],         // bad for performance but good enough for this test app.       TODO: replace by a buffer (FIFO)
    inputEvents: [],
    inputPorts: [],
    outputPorts: []
}

// redux reducer
function reducer(state = initialState, action) {
    switch (action.type) {
        case 'ADD_ID':
            console.log(`reducer: add id ${action.id} to stats inputPorts`);
            return { ...state, inputPorts: [...state.inputPorts, action.id]};
        case 'ADD_EVENT':       // TODO: use combineReducer; see https://www.smashingmagazine.com/2016/06/an-introduction-to-redux/
                                //                               https://redux.js.org/docs/recipes/reducers/UsingCombineReducers.html
            console.log(`reducer: add event`, action.event);
            return { ...state, events: [...state.events, action.event], inputPorts: [...state.inputPorts, action.event.port.id]};
        case 'ADD_INPUT_EVENT':
            return { ...state, inputEvents: [...state.inputEvents, action.event]};
        default:
            return state
    }
}

//TODO
function eventsReducer(state = {globalEvents:[], inputEvents:[]}, action) {
    switch (action.type) {
        case 'ADD_EVENT':
            return { ...state, events: [...state.events, action.event]};
        case 'ADD_INPUT_EVENT':
            return { ...state, inputEvents: [...state.inputEvents, action.event]};
        // 'ADD_INPUT_LISTENER'
        // 'REMOVE_INPUT_LISTENER'
        default:
            return state
    }
}

//TODO
function portsReducer(state = {inputPorts:[], outputPorts:[]}, action) {
    switch (action.type) {
        case 'ADD_INPUT_PORT':
            return { ...state, inputPorts: [...state.inputPorts, action.port.id]};
        case 'REMOVE_INPUT_PORT':
        case 'ADD_OUTPUT_PORT':
        case 'REMOVE_OUTPUT_PORT':
        default:
            return state
    }
}

// redux store
const store = createStore(reducer);


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

function inputPorts(props) {
    console.log("render <Connected>", props.inputPorts);
    if (!props.inputPorts || props.inputPorts.length===0) return <div></div>;
    return (
        <div>
            <h4>connected inputs:</h4>
            <ul>
                {props.inputPorts.map(id => <li key={id}>{inputName(id)}</li>)}
            </ul>
        </div>
    );
}


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

    // MOVED INTO REDUX STORE
/*
    state = {
        // inputs: null,    // no need to store inputs or outputs in the state because WebMidi object is globally accessible.
        // outputs: null,
        events: [],         // bad for performance but good enough for this test app.       TODO: replace by a buffer (FIFO)
        inputEvents: [],         // bad for performance but good enough for this test app.  TODO: replace by a buffer (FIFO)
        inputPorts: []             // ids of inputs we listen to
    };
*/

    constructor(props) {
        super(props);
        this.midiOn = this.midiOn.bind(this);
        // this.handleMidiState = this.handleMidiState.bind(this);
        this.handleMidiEvent = this.handleMidiEvent.bind(this);
        this.handleMidiInputEvent = this.handleMidiInputEvent.bind(this);
        this.handleSelection = this.handleSelection.bind(this);

        // REDUX:
        // default state
        this.state = store.getState();
        // function that will execute every time the state changes
        this.unsubscribe = store.subscribe(() => {      // Adds a change listener. It will be called any time an action is dispatched,
            this.setState(store.getState());            // and some part of the state tree may potentially have changed. You may then call getState()
        });                                             // to read the current state tree inside the callback.
                                                        // RETURNS a function that unsubscribes the change listener.

    }

    componentWillUnmount() {
        this.unsubscribe();
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
        // this.setState({ events: [...this.state.events, e]})

        store.dispatch(addEvent(e));

        // this.handleMidiState();
        console.groupEnd();
    }

    handleMidiInputEvent(e) {
        console.log('handleMidiInputEvent', e);

        // console.log(eventToString(e));

        // We store all the events in order to display them.
        // In a real app, only store the last event per port and type.
        console.log('add event to state.inputEvents');
        // this.setState({ inputEvents: [...this.state.inputEvents, e]})
        store.dispatch(addInputEvent(e));

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
        console.log('add input to state.inputPorts');
        // this.setState({inputPorts: [...this.state.inputPorts, id]});
        store.dispatch(addId(id));
    }

    disconnectInput(id) {
        const i = inputById(id);
        if (i) {
            i.removeListener();
            console.log(`disconnectInput: input ${id} disconnected`);
        } else {
            console.log(`disconnectInput: input ${id} not found`);
        }
        let current = this.state.inputPorts;
        current.splice(current.indexOf(id), 1);     // remove id from array
        console.log('remove input from state.inputPorts');
        this.setState({inputPorts: current});
    }

    handleSelection(id) {
        console.group('handleSelection', id);
        if (this.state.inputPorts.includes(id)) {
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
            <Provider store={store}>
                <div className="App">

                    <h2>Events:</h2>
                    <PortEvents count={10} />

                    <h2>Inputs:</h2>
                    <Ports ports={WebMidi.inputs} handleSelection={this.handleSelection} />
{/*

                    <inputPorts inputPorts={this.state.inputPorts} />
                    <InputEvents events={this.state.inputEvents} count={10} />

                    <h2>Outputs:</h2>
                    <Ports ports={WebMidi.outputs} />
*/}
                </div>
            </Provider>
        );
    }

}

export default App;

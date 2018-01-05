import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {combineReducers, createStore} from "redux";
import {Provider, connect} from 'react-redux';
import './App.css';
import WebMidi from '../node_modules/webmidi';
import {isConnectEvent, isDisconnectEvent, eventToString, eventUniqueID} from "./utils/events";
import Ports from "./components/Ports";
import PortEvents from "./components/PortEvents";
import StateEvents from "./components/StateEvents";
import {inputFromId, inputName} from "./utils/ports";

// redux action creators
function addPort(portType, portId) {    // port Object
    return {type: 'ADD_PORT', port: {type: portType, id: portId}};
}
function removePort(portType, portId) {
    return {type: 'REMOVE_PORT', port: {type: portType, id: portId}};
}
function addStateEvent(event) {
    console.log('add state event');
    return {type: 'ADD_STATE_EVENT', event};
}
function addInputEvent(event) {
    return {type: 'ADD_INPUT_EVENT', event};
}

// REDUCERS

// A reducer takes the current state and returns a new state depending on the action.
// The state can never be undefined so you should always give it a default state
// and always return some sort of state (never undefined).

/*
const initialState = {
    events: [],         // bad for performance but good enough for this test app.       TODO: replace by a buffer (FIFO)
    inputEvents: [],
    inputPorts: [],
    outputPorts: []
}
*/

function eventsReducer(state = {stateEvents:[], inputEvents:[]}, action) {
    // console.log('eventsReducer: {}', action);
    switch (action.type) {
        case 'ADD_STATE_EVENT':
            return { ...state, stateEvents: [...state.stateEvents, action.event]};
        case 'ADD_INPUT_EVENT':
            return { ...state, inputEvents: [...state.inputEvents, action.event]};
        // case 'ADD_INPUT_LISTENER':
        // case 'REMOVE_INPUT_LISTENER':
        default:
            return state
    }
}

function portsReducer(state = {inputPorts:[], outputPorts:[]}, action) {
    // console.log('portsReducer: {}', action);
    let p;
    let a;
    switch (action.type) {

        case 'ADD_PORT':
            p = action.port;
            a = p.type === 'input' ? 'inputPorts' : 'outputPorts';  // select array to update

            //FIXME: move logic into the action creator

            if (state[a] && state[a].includes(p.id)) {
                console.warn(`portsReducer: ADD_PORT: port ID ${p.id} already presents in state[${a}]`);
                return state;
            } else {
                console.log(`portsReducer: ADD_PORT: add port ID ${p.id} to state[${a}]`);
                return { ...state, [a]: [...state[a], p.id]};       // [a] syntax is https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer#Computed_property_names
            }

        case 'REMOVE_PORT':
            p = action.port;
            a = p.type === 'input' ? 'inputPorts' : 'outputPorts';  // select array to update

            //FIXME: move logic into the action creator

            if (state[a] && state[a].includes(p.id)) {
                console.log(`portsReducer: REMOVE_PORT: remove port ID ${p.id} from state[${a}]`);
                let b = state[a].slice();        // make a copy of the existing array
                b.splice(b.indexOf(p.id), 1);    // remove id from array
                return { ...state, [a]: b};
            } else {
                // port was not added probably because it was not open
                console.log(`portsReducer: REMOVE_PORT: port ID ${p.id} was not presents in state[${a}]`);
                return state;
            }

        // case 'ADD_INPUT_PORT':
        //     return { ...state, inputPorts: [...state.inputPorts, action.port.id]};
        // case 'REMOVE_INPUT_PORT':
        // case 'ADD_OUTPUT_PORT':
        // case 'REMOVE_OUTPUT_PORT':

        default:
            return state
    }
}

// redux store
const store = createStore(combineReducers({events: eventsReducer, ports: portsReducer}));

class App extends Component {

    constructor(props) {

        super(props);

        this.midiOn = this.midiOn.bind(this);
        // this.handleMidiState = this.handleMidiState.bind(this);
        this.handleStateEvent = this.handleStateEvent.bind(this);
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

    handleStateEvent(e) {
        console.group(`handleStateEvent: ${e.port.constructor.name} ${e.type}: ${e.port.name}`, e);

        // let connection = e.port.connection; // copy the _current_ connection state (for logging), because this same property will be updated in WebMidi object

        // We store all the events in order to display them.
        // In a real app, only store the last event per port and type.
        console.log('add stateEvent to state.stateEvents', e);
        // this.setState({ events: [...this.state.events, e]})

        store.dispatch(addStateEvent(e));   //FIXME: add input must be done in a specific method

        if (isConnectEvent(e)) {
            console.log(`connect event for ${e.port.name} ${e.port.id}`);

            if (e.port.connection === 'open') {
                store.dispatch(addPort(e.port.type, e.port.id));   //FIXME: add input must be done in a specific method
                // if (state.inputPorts && state.inputPorts.includes(e.port.id)) {
                //     console.warn(`handleStateEvent: ID ${e.port.id} already presents in state.inputPorts`);
                // } else {
                //     return { ...state, inputPorts: [...state.inputPorts, ev.port.id]};
                // }
            } else {
                console.log(`handleStateEvent: ignore connected input "${e.port.name}" because connection state is ${e.port.connection}`);
            }
        }

        // is disconnect event, remove the existing input listeners
        if (e.type === "disconnected") {
            console.log(`disconnect event for ${e.port.name} ${e.port.id}`);
            this.disconnectInput(e.port.id);

            store.dispatch(removePort(e.port.type, e.port.id));
        }

        // Note: if we don't display the events, than the UI will not be updated if we don't update the state.
        //       In that case we should call forceUpdate().
        //       More info in README.md.

        // this.handleMidiState();
        console.groupEnd();
    }

    handleMidiInputEvent(e) {
        console.log('handleMidiInputEvent', e);

        // We store all the events in order to display them.
        // In a real app, only store the last event per port and type.
        console.log('add event to state.inputEvents');
        // this.setState({ inputEvents: [...this.state.inputEvents, e]})
        store.dispatch(addInputEvent(e));

        // this.handleMidiState();
    }

    connectInput(id) {
        const i = inputFromId(id);
        if (i) {
            i.addListener('noteon', 'all', this.handleMidiInputEvent);
            console.log(`connectInput: input ${id} connected`);
        } else {
            console.log(`connectInput: input ${id} not found`);
        }
        // console.log('add input to state.inputPorts');
        // this.setState({inputPorts: [...this.state.inputPorts, id]});
        // store.dispatch(addId(id));
        //TODO: dispatch
    }

    disconnectInput(id) {
        const i = inputFromId(id);
        if (i) {
            i.removeListener();
            console.log(`disconnectInput: input ${id} disconnected`);
        } else {
            console.log(`disconnectInput: input ${id} not found`);  // probably already removed by webmidi.js from the WebMidi object
        }

        // let current = this.state.inputPorts;
        // current.splice(current.indexOf(id), 1);     // remove id from array
        // console.log('remove input from state.inputPorts');
        // this.setState({inputPorts: current});
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
            WebMidi.addListener("connected", this.handleStateEvent);
            WebMidi.addListener("disconnected", this.handleStateEvent);
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

                    <h2>State events:</h2>
                    <StateEvents count={10} />

                    <h2>Inputs:</h2>
                    <Ports type="input" handleSelection={this.handleSelection} />

                    <h2>Outputs:</h2>
                    <Ports type="output" />

{/*

                    <inputPorts inputPorts={this.state.inputPorts} />
                    <InputEvents events={this.state.inputEvents} count={10} />

*/}
                    <pre className={"debug"}>{JSON.stringify(this.state.ports, null, 3)}</pre>
                </div>
            </Provider>
        );
    }

}

export default App;

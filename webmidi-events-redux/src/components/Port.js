import React, {Component} from 'react';
import ChannelSelect from "./ChannelSelect";
import WebMidi from "webmidi";
import {portFromId} from "../utils/ports";


/**
 * Represents an input or output port
 */
export default class Port extends Component {

    /**
     * Render a single midi connection
     * @param c
     * @returns {*}
     */
    connection(id, props) {
        console.log('connection', id, props);
        let p = portFromId(id);
        if (p) {
            return (
                <div>
                    <b>{p.name}</b>: {p.type} {p.connection} {p.state} "{p.manufacturer}" {p.id}
                </div>
            );
        } else {
            return (
                <div>port not found: {id}</div>
            );
        }
        /*
        switch (c.type) {
            case 'input':
                console.log('input', props);
                let select = '';
                if (props.connectedInputs &&
                    props.connectedInputs.length > 0 &&
                    props.connectedInputs.includes(c.id)) {
                    select = <ChannelSelect />;
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
                console.log('output', props);
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
        */
    }

    render() {
        console.log('Port.render', this.props);
        return this.connection(this.props.id, this.props)
    }

}

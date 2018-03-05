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
        /*
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
        */

        switch (p.type) {
            case 'input':
                // console.log('input', props);
                let select = 'yolo';
/* TODO
                if (props.connectedInputs &&
                    props.connectedInputs.length > 0 &&
                    props.connectedInputs.includes(c.id)) {
                    select = <ChannelSelect />;
                }
*/
                return (
                    <div>
                        {/*<label>*/}
                            {/*<input type="checkbox" onClick={() => props.handleSelection(p.id)} onClick={this.handleClick} />*/}
                            {/*<a onClick={this.handleClick}>configure</a>*/}
                        {/*</label>*/}
                        <b>{p.name}</b>: {p.type} {p.connection} {p.state} {p.manufacturer} {p.id}
                        <span className="switch"><a href="#" onClick={this.handleClick}>configure</a></span>
                        {this.state.isOpen && <ChannelSelect id={p.id} handleSelection={props.handleSelection} />}
                    </div>
                );
            case 'output':
                console.log('output', props);
                return (
                    <div>
                        <b>{p.name}</b>: {p.type} {p.connection} {p.state} {p.manufacturer} {p.id}
                    </div>
                );
            default:
                return (
                    <div>port not found: {id}</div>
                );
        }

    }

    constructor(props) {
        super(props);
        this.state = {isOpen: false};
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick() {
        this.setState(function(prevState) {
            console.log(prevState.isOpen);
            return {isOpen: !prevState.isOpen};
        });
    }

    render() {
        console.log('Port.render', this.props);
        return this.connection(this.props.id, this.props)
    }

}

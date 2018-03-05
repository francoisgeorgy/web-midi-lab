import React, {Component} from 'react';
import {portFromId} from "../utils/ports";

export default class ChannelSelect extends Component {

    // props: id of input channel (is always an input channel, we can not "listen" to an ouput channel)

    constructor(props) {
        super(props);
        // this.state = {isOpen: false};
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick(i) {
        console.log(`channel click: ${i}`);
        // this.setState(function(prevState) {
        //     console.log(prevState.isOpen);
        //     return {isOpen: !prevState.isOpen};
        // });
    }

    render() {

        let p = portFromId(this.props.id);
/*
        if (p) {
            if (p.hasListener()) {      // hasListener ( type  channel  listener ) Boolean

            }
        }

    see: WebMidi.MIDI_SYSTEM_MESSAGES, WebMidi.MIDI_CHANNEL_MESSAGES


*/
        return (
            <div>
                listen on channel:
                <label style={{marginRight: '0.5em'}}><input type="checkbox" value="all" onClick={() => this.props.handleSelection(this.props.id, 'all')} />all</label>
                {[...Array(16)].map((v, i) =>
                    <label key={i} style={{marginRight: '0.5em'}}><input
                        type="checkbox"
                        value={i + 1}
                        onChange={(event) => this.props.handleSelection(this.props.id, i + 1, event.target.checked)} />{i + 1}</label>
                        // onClick={() => this.handleClick(i + 1)} />{i + 1}</label>
                )}
            </div>
        )
    }

}
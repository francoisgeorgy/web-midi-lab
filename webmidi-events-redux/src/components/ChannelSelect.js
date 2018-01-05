import React, {Component} from 'react';
import {portFromId} from "../utils/ports";

export default class ChannelSelect extends Component {

    // props: id of input channel (is always an input channel, we can not "listen" to an ouput channel)

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
                <label><input type="checkbox" value="all" />all</label>
                {[...Array(16)].map((v, i) =>
                    <label key={i}><input type="checkbox" value={i + 1}/>{i + 1}</label>
                )}
            </div>
        )
    }

}
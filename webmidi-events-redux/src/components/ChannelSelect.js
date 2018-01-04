import React, {Component} from 'react';

export default class ChannelSelect extends Component {

    render() {
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
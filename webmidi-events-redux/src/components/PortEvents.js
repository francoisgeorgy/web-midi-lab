import React, {Component} from 'react';
import {connect} from "react-redux";
import {eventToString, eventUniqueID} from "../utils/events";

/**
 * Render the N last midi events
 * @param props
 * @constructor
 */
class PortEvents extends Component {
    render() {
        const { events, count } = this.props;
        console.log("PortEvents.render", events);
        let n = Math.min(count || 0, events.length);
        return (
            <div>
                {events.slice(-n).reverse().map(e => <div key={eventUniqueID(e)}>{eventToString(e)}</div>)}
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        events: state.events   //,
        // inputEvents: state.inputEvents,
        // connectedInputs: state.connectedInputs
    }
}

// very important!
export default PortEvents = connect(mapStateToProps)(PortEvents);

/*

PortEvents.propTypes = {
    count: PropTypes.number,
    events: PropTypes.array.isRequired
};
*/

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
        console.log("PortEvents.render", count, events);
        let ev = events.inputEvents;
        let n = Math.min(count || 0, ev.length);
        if (events) {
            return (
                <div className="box events">
                    {ev.slice(-n).reverse().map(e => <div key={eventUniqueID(e)}>{eventToString(e)}</div>)}
                </div>
            );
        } else {
            return <div></div>
        }
    }
}

const mapStateToProps = (state) => {
    return {
        events: state.events
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

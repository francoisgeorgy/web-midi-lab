import React, {Component} from 'react';
import {connect} from "react-redux";
import {eventToString, eventUniqueID} from "../utils/events";

/**
 * Render the N last midi events
 * @param props
 * @constructor
 */
class StateEvents extends Component {
    render() {
        const { events, count } = this.props;
        console.log("StateEvents.render", count, events);
        let ev = events.stateEvents;
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
export default StateEvents = connect(mapStateToProps)(StateEvents);

/*

StateEvents.propTypes = {
    count: PropTypes.number,
    events: PropTypes.array.isRequired
};
*/

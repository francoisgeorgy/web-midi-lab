import React, {Component} from 'react';
import {connect} from "react-redux";
import Port from "./Port";


class Ports extends Component {

    render() {
        const { ports, inputPorts } = this.props;
        console.log('Ports.render props', this.props);
        console.log('Ports.render ports', ports);
        console.log('Ports.render inputPorts', inputPorts);
        return (
            <div>
                <ul>
                {ports.map(port =>
                    <li key={port.id}>
                        <Port port={port}/>
                    </li>
                )}
                </ul>
            </div>
        )
    }
}


/*
const mapDispatchToProps = (dispatch) => {
    return {
        updateFilter: (ev) => dispatch(setFilter(ev.target.value))
    }
}
*/


// https://github.com/reactjs/react-redux/blob/master/docs/api.md
// https://github.com/reactjs/react-redux/issues/324
const mergeProps = (stateProps, dispatchProps, ownProps) => {
    return {
        ...stateProps,
        ...ownProps,
    };
};

const mapStateToProps = (state, ownProps) => {
    console.log('mapStateToProps', state, ownProps);
    console.log('mapStateToProps', ownProps.ports.length, ownProps.ports);
    return {
        // events: state.events,   // HACK needed to force re-rendering --> put midi inputs in "availableInputs" array
        // inputEvents: state.inputEvents,
        // ports: ownProps.ports,
        inputPorts: state.inputPorts
    }
}

// export default Ports = connect(mapStateToProps, null, mergeProps)(Ports);
export default Ports = connect(mapStateToProps)(Ports);

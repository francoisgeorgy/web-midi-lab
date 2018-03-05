import React, {Component} from 'react';
import {connect} from "react-redux";
import Port from "./Port";


class Ports extends Component {

    render() {
        const {type, /* handleSelection, */ ports} = this.props;
        console.log('Ports.render props', this.props);
        console.log('Ports.render ports', type, ports);
        // console.log('Ports.render inputPorts', inputPorts);
        return (
            <div className="box ports">
            {ports[type === 'input' ? 'inputPorts' : 'outputPorts'].map(port =>
                <Port key={port} id={port} {...this.props.handleSelection ? {'handleSelection':this.props.handleSelection} : {}} />  // ... has a lower precedence than the conditionnal operator
            )}
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
/*
const mergeProps = (stateProps, dispatchProps, ownProps) => {
    return {
        ...stateProps,
        ...ownProps,
    };
};
*/

const mapStateToProps = (state) => {
    // console.log('mapStateToProps', state, ownProps);
    // console.log('mapStateToProps', ownProps.ports.length, ownProps.ports);
    return {
        // events: state.events,   // HACK needed to force re-rendering --> put midi inputs in "availableInputs" array
        // inputEvents: state.inputEvents,
        // ports: ownProps.ports,
        ports: state.ports
    }
}

// export default Ports = connect(mapStateToProps, null, mergeProps)(Ports);
export default Ports = connect(mapStateToProps)(Ports);

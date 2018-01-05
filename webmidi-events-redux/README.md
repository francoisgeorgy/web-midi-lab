# webmidi-events

- There is no need to save the WebMidi inputs and outputs in the _state_. The `WedMidi` object os global and can
therefore be directly accessed.

- Each change of input or output is notified by an event sent by WebMidi. So, the application's state needs to be
updated each time WedMidi send an event.
 
# Dev notes

__Force UI update when an event occurs:__ If we don't display events and since we don't store the inputs/outputs in the state, 
when a change occurs in WebMidiJS than we need to be able to update the UI. We have the following two possibilities:

    forceUpdate()

Calling `forceUpdate()` will cause `render()` to be called on the component, skipping `shouldComponentUpdate()`. 
Doc: https://reactjs.org/docs/react-component.html#forceupdate
    
    setState()

`setState()` will always trigger a re-render unless conditional rendering logic is implemented in  shouldComponentUpdate(). 
Doc: https://reactjs.org/docs/react-component.html#setstate

More info: https://stackoverflow.com/questions/30626030/can-you-force-a-react-component-to-rerender-without-calling-setstate


## Redux

http://jilles.me/react-redux-and-react-redux/

If we do not save the midi inputs/outputs in the state, then the associated components (e.g. Ports) will not
rerender when the list change in WebMidi. So, instead of storing only the _connected_ (the one we listen to) input in the
state, we will "mirror" the WebMidi inputs/outputs arrays. That is, we will update the state each time a connect or disconnect
event is received. 

We will save the following global state in Redux:

- available ports with, for each:
    - type : input / output
    - ignore : boolean  (we consider any port active by default)
    - ID : String
    - channel(s) : number(s) or "all"
    - msg types : array of String
    
- events

We store events so we can have components displaying only some kind of events. 
Having only a global state in redux store simplify the implementation.

#### W3C Web Midi events:

https://www.w3.org/TR/webmidi/#event-midiaccess-statechange

- `onstatechange` of type `MIDIConnectionEvent` : The handler called when a new port is connected or an existing port changes the state attribute.

                                                  
## Notes about Redux

### `mapStateToProps`, `ownProps`

> This means that any time the store is updated, mapStateToProps will be called. 
> The results of mapStateToProps must be a plain object, which will be __merged into the component’s props__.

Good example of `ownProps`: https://spin.atomicobject.com/2017/04/14/react-redux-props/

> [...] keep in mind that the props available to the component are the result of  Object.assign({}, ownProps, stateProps, dispatchProps), 
> meaning if  stateProps or dispatchProps (which I didn’t talk about here) have any of the same properties as ownProps, 
> they will overwrite ownProps. 

Doc: https://github.com/reactjs/react-redux/blob/master/docs/api.md#arguments

### action creators

- https://github.com/reactjs/redux/issues/1171

- https://medium.com/javascript-scene/10-tips-for-better-redux-architecture-69250425af44 :

    // Action creators can be impure.
    export const addChat = ({
        // cuid is safer than random uuids/v4 GUIDs
        // see usecuid.org
        id = cuid(),
        msg = '',
        user = 'Anonymous',
        timeStamp = Date.now()
        } = {}) => ({
            type: ADD_CHAT,
            payload: { id, msg, user, timeStamp }
        });

- https://redux.js.org/docs/basics/Actions.html :   

> Other than type, the structure of an action object is really up to you. 
> If you're interested, check out Flux Standard Action for recommendations on how actions could be constructed.

https://github.com/acdlite/flux-standard-action

An action MUST

be a plain JavaScript object.
have a type property.
An action MAY

have an error property.
have a payload property.
have a meta property.
An action MUST NOT include properties other than type, payload, error, and meta.
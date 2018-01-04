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


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

We will save the following global state in Redux:

- connected inputs with, for each:
    - input ID : String
    - channel : number or "all"
    - types : array of String
    
- events

We store events so we can have components displaying only some kind of events. 
Having only a global state in redux store simplify the implementation.

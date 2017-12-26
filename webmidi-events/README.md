# webmidi-events

- There is no need to save the WebMidi inputs and outputs in the _state_. The `WedMidi` object os global and can
therefore be directly accessed.

- Each change of input or output is notified by an event sent by WebMidi. So, the application's state needs to be
updated each time WedMidi send an event.
 
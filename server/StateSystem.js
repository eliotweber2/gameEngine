const randomUUID = require('crypto').randomUUID;

class StateSystem {
    constructor() {
        //state can be added to by user
        this.state = {
            pressedKeys:[],
            mousePos:{x:0,y:0},
        }
        this._tickEvents = []
        this._listeners = [];
    }

    //handles firing event
    _handleEvent(eventName,eventData,eventTypes,deltaTime,isTickEvent) {
        const newEvent = {
            name: eventName,
            types: eventTypes,
            data: eventData,
            deltaTime: deltaTime,
            isComplete: false,
        }
        //adds to list of tick events if it is a tick event else fires immediately
        if (isTickEvent) {this._tickEvents.push(newEvent)} else {setTimeout(() => this._fireEvent(newEvent),0)}
    }

    //actually emits the event
    _fireEvent(event) {
        //get valid listeners
        const eventListeners = this._listeners.filter(listener => listener.eventFn(event));
        //sort by layer number
        eventListeners.sort((listenerA,listenerB) => (listenerA.layerNum - listenerB.layerNum));
        //fire event
        for (let listener of eventListeners) {
            if (!event.isComplete) {listener.callbackOnEvent(event)}
        }
    }

    //handles key presses from client
    handleKeyPress(eventData,deltaTime) {
        this.state.pressedKeys.push(eventData.key);
        const keyPressEventName = 'KEYPRESS ' + eventData.key;
        const keyHoldEventName = 'KEYHOLD ' + eventData.key;
        this._handleEvent(keyHoldEventName,eventData,['INPUT','KEYHOLD'],deltaTime,true);
        this._handleEvent(keyPressEventName,eventData,['INPUT','KEYPRESS'],deltaTime,false);
    }

    handleKeyUp(eventData,deltaTime) {
        const eventName = 'KEYUP ' + eventData.key;
        this._handleEvent(eventName,eventData,['INPUT','KEYUP'],deltaTime,false);
        this.removeTickEvent('KEYHOLD ' + eventData.key);
        this.state.pressedKeys = this.state.pressedKeys.filter(x => x != eventData.key);
    }

    //fires all tick events
    fireTickEvents(deltaTime) {
        this._tickEvents.forEach((event) => {
            //makes clone of event and fires it
            const newEvent = structuredClone(event);
            newEvent.deltaTime = deltaTime;
            this._fireEvent(newEvent);
        });
    }

    removeTickEvent(eventName) {
        this._tickEvents = this._tickEvents.filter((event) => event.name != eventName);
    }

    addListener(eventFn,callback,layerNum) {
        const newListener = {eventFn: eventFn, callbackOnEvent: callback, layerNum: layerNum, id:randomUUID()}
        this._listeners.push(newListener);
        return newListener;
    }

    removeListener(removedListener) {
        this._listeners = this._listeners.filter(listener => listener.id != removedListener.id);
    }

    fireCustomEvent(eventName,eventData,eventTypes,deltaTime=null,isTickEvent=false) {
        eventTypes.push('CUSTOM');
        this._handleEvent(eventName,eventData,eventTypes,deltaTime,isTickEvent);
    }

    //should not be used by user
    fireSysEvent(eventName,eventData,eventTypes,deltaTime=null,isTickEvent=false) {
        this._handleEvent(eventName,eventData,eventTypes,deltaTime,isTickEvent);
    }
}



exports.StateSystem = StateSystem;

/*
Event structure:
    Name
    Types
    Data
    isCompleted
    DeltaTime?

Event types:
    Input
    Key
    Keypress
    Keyhold
    Keyup
    Custom
    Engine
    Mouse

Listener structure:
    Event function
    Callback
    Layer number (listeners with a lower layer number will recieve event first)
*/
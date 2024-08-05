const randomUUID = require('crypto').randomUUID;

class EventSystem {
    constructor() {
        this.state = {
            pressedKeys:[],
            mousePos:{x:0,y:0},
        }
        this._tickEvents = []
        this._listeners = [];
        this._eventQueue = [];
    }

    _handleEvent(eventName,eventData,eventTypes,deltaTime,isTickEvent) {
        const newEvent = {
            name: eventName,
            types: eventTypes,
            data: eventData,
            deltaTime: deltaTime,
            isComplete: false,
        }
        if (isTickEvent) {this._tickEvents.push(newEvent)} else {setTimeout(() => this._fireEvent(newEvent),0)}
    }

    _fireEvent(event) {
        const eventListeners = this._listeners.filter(listener => listener.eventFn(event));
        eventListeners.sort((listenerA,listenerB) => (listenerA.layerNum - listenerB.layerNum));
        for (let listener of eventListeners) {
            if (!event.isComplete) {listener.callbackOnEvent(event)}
        }
    }

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

    fireTickEvents(deltaTime) {
        this._tickEvents.forEach((event) => {
            const newEvent = structuredClone(event);
            newEvent.deltaTime = deltaTime;
            this._fireEvent(newEvent);
        });
    }

    removeTickEvent(eventName) {
        this._tickEvents = this._tickEvents.filter((event) => event.name != eventName);
    }

    addListener(eventFn,callback,layerNum) {
        const newListener = {eventFn: eventFn, callbackOnEvent: callback, layerNum: layerNum,id:randomUUID()}
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
}

exports.EventSystem = EventSystem;

/*
Event structure:
    Name
    Types
    Data
    isCompleted
    DeltaTime?

Event types:
    Input
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
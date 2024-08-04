class StateMachine {
    constructor() {
        this.state = {
            pressedKeys:[],
        }
        this.tickEvents = []
        this.listeners = [];
    }

    _handleEvent(eventName,eventData,deltaTime,isTickEvent=false) {
        const customEvent = {
            data: eventData,
            deltaTime: deltaTime,
        }
        if (isTickEvent) {
            this.tickEvents.push(
                {name:eventName,data:eventData}
            )
        }
        this.listeners.forEach((listener) => {
            if (listener.eventName == eventName) {
                listener.callbackOnEvent(customEvent);
            }
        });
    }

    handleKeyPress(eventData,deltaTime) {
        const keyPressEventName = 'KEYPRESS ' + eventData.key;
        const keyHoldEventName = 'KEYHOLD ' + eventData.key;
        this._handleEvent(keyHoldEventName,eventData,deltaTime,true);
        this.state.pressedKeys.push(eventData.key);
        this._handleEvent(keyPressEventName,eventData,deltaTime,false);
    }

    handleKeyUp(eventData,deltaTime) {
        const eventName = 'KEYUP ' + eventData.key;
        this.state.pressedKeys = this.state.pressedKeys.filter(x => x != eventData.key);
        this.removeTickEvent('KEYHOLD ' + eventData.key);
        this._handleEvent(eventName,eventData,deltaTime);
    }

    fireTickEvents(deltaTime) {
        this.tickEvents.forEach((event) => this._handleEvent(event.name,event.data,deltaTime,false));
    }

    removeTickEvent(eventName) {
        this.tickEvents = this.tickEvents.filter((event) => event.name != eventName);
    }

    addListener(eventName,callback) {
        this.listeners.push(
            {eventName:eventName,callbackOnEvent:callback}
        );
    }

    fireCustomEvent(eventName,eventData,deltaTime,isTickEvent=false) {
        this._handleEvent(eventName,eventData,deltaTime,isTickEvent);
    }
}

exports.StateMachine = StateMachine;

/*
Event naming scheme:
(Event type) (Custom event name)
*/
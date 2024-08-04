

class Engine {
    constructor(socket,game) {
        this.socket = socket;
        this.game = game;
        this.stateMachine = game.stateMachine;
        this.lastTime = Date.now();
        this.deltaTime = 0;
    }

    handleMessage(message) {
        const requestCode = message.slice(0,4);
        const payload = message.slice(5);
        switch (requestCode) {
            case 'CLST': this.handleClientState(JSON.parse(payload));
        }
    }

    handleClientState(message) {
        this.deltaTime = message.time - this.lastTime;
        this.lastTime = message.time;
        for (let input of message) {
            if (!input.isRelease) {
                this.stateMachine.handleKeyPress(input.eventData,this.deltaTime);
            } else {
                this.stateMachine.handleKeyUp(input.eventData,this.deltaTime); 
            }
        }
    }
}

exports.Engine = Engine;
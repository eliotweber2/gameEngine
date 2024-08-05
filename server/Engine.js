class Engine {
    constructor(game) {
        this.game = game;
        this.socket = null;
        this.eventSystem = game.eventSystem;
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
        for (let input of message.keyEvents) {
            if (!input.isRelease) {
                this.eventSystem.handleKeyPress(input.eventData,this.deltaTime);
            } else {
                this.eventSystem.handleKeyUp(input.eventData,this.deltaTime); 
            }
        }
        this.socket.sendData('','NFME');
    }

    mainloop() {
        this.eventSystem.fireTickEvents();
        this.eventSystem.fireCustomEvent('NEXTFRAME',{},['ENGINE'],this.deltaTime,false);
    }

    handleStart() {
        this.eventSystem.addListener((event) => event.name == 'NEXTFRAME',() => this.mainloop());
        this.mainloop();
        this.socket.sendData('','NFME');
    }
}

exports.Engine = Engine;
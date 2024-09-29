const physEngine = require('matter-js').Engine;
const Wireframe = require('./Wireframe.js');

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
    }

    mainloop() {
        this.eventSystem.fireTickEvents();
        physEngine.update(this.game.activeScene.engine,this.deltaTime);
        this.render('WIREFRAME');
        this.eventSystem.fireCustomEvent('NEXTFRAME',{},['ENGINE'],this.deltaTime,false);
    }

    render(renderType) {
        let rendered;
        switch (renderType) {
            case 'WIREFRAME': rendered = Wireframe.getRender(this.game.activeScene); break;
            default: console.log('Invalid render method');
        }
        this.socket.sendData(JSON.stringify(rendered),'NFME', null, ()=>{process.exit(1)});
    } 

    handleStart() {
        this.eventSystem.addListener((event) => event.name == 'NEXTFRAME',() => this.mainloop());
        this.mainloop();
        this.socket.sendData(JSON.stringify([]),'NFME');
    }
}

exports.Engine = Engine;
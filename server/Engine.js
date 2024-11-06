const physEngine = require('matter-js').Engine;
const Wireframe = require('./Wireframe.js');

class Engine {
    constructor(game) {
        this.game = game;
        this.socket = null;
        this.stateSystem = game.stateSystem;
        this.lastTime = Date.now();
        this.deltaTime = 0;
        this.shouldContinue = true;
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
        for (let event of message.events) {
            switch (event.type) {
                case 'key':
                    if (!event.isRelease) {
                        this.stateSystem.handleKeyPress(event.eventData,this.deltaTime);
                    } else {
                        this.stateSystem.handleKeyUp(event.eventData,this.deltaTime); 
                    }
                    break;
                case 'mouse':
                    this.stateSystem.fireSysEvent('MOUSECLICK'+event.eventData.name,event.eventData,['INPUT','MOUSECLICK'],this.deltaTime,false); break;
            }
        }
    }

    mainloop() {
        this.stateSystem.fireTickEvents();
        physEngine.update(this.game.activeScene.engine,this.deltaTime);
        this.render('WIREFRAME');
        if (this.shouldContinue) {
            this.stateSystem.fireSysEvent('NEXTFRAME',{},['ENGINE'],this.deltaTime,false);
        } else {
            console.log('Engine stopped');
            process.exit(0);
        }
    }

    render(renderType) {
        let rendered;
        switch (renderType) {
            case 'WIREFRAME': rendered = Wireframe.getRender(this.game.activeScene); break;
            default: console.log('Invalid render method');
        }
        this.socket.sendData(JSON.stringify(rendered),'NFME', null, ()=>{process.exit(0)});
    } 

    handleStart() {
        this.stateSystem.addListener((event) => event.name == 'NEXTFRAME',() => this.mainloop());
        this.mainloop();
        this.socket.sendData(JSON.stringify([]),'NFME');
    }
}

exports.Engine = Engine;
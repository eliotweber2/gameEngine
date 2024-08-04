const StateMachine = require('./stateMachine.js').StateMachine;
const Engine = require('./Engine.js').Engine;

class Game {
    constructor(socket) {
        this.stateMachine = new StateMachine();
        this.engine = new Engine(socket,this);
        this.sceneLst = [];
        this.data = {};
    }
}

exports.Game = Game;
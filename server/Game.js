const EventSystem = require('./eventSystem.js').EventSystem;
const startServer = require('./serverSocketInterface.js').startServer;
const Engine = require('./Engine.js').Engine;

class Game {
    constructor() {
        this.eventSystem = new EventSystem();
        this.engine = new Engine(this);
        this.sceneLst = [];
        this.data = {};
    }

    set socket(socket) {
        this.engine.socket = socket;
    }

}

const startGame = function(buildGame) {
    startServer((socket) => {
        const game = buildGame();
        game.socket = socket;
        return game.engine;
    });
}

exports.Game = Game;
exports.startGame = startGame;
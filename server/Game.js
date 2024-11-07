const StateSystem = require('./StateSystem.js').StateSystem;
const startServer = require('./serverSocketInterface.js').startServer;
const Engine = require('./Engine.js').Engine;

const Components = require('./Components.js');

const Scene = Components.Scene,
      Container = Components.Container,
      Actor = Components.Actor;

class Game {
    constructor() {
        //set up separate state system and engine
        this.stateSystem = new StateSystem();
        this.engine = new Engine(this);
        this.sceneLst = {};
        this.state = {};
        this.activeScene = null;
    }

    addScene(name) {
        const newScene = new Scene();
        this.sceneLst[name] = newScene;
        newScene.name = name;
        newScene.parent = this;
    }

    set socket(socket) {
        this.engine.socket = socket;
    }

}

const startGame = function(buildGame) {
    startServer((socket) => {
        const game = buildGame();
        game.socket = socket;
        if (game.activeScene == null) {
            game.addScene('default');
            game.activeScene = game.sceneLst['default'];
        }
        return game.engine;
    });
}

exports.Game = Game;
exports.startGame = startGame;
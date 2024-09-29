let Game = require('../server/Game');
const Body = require('matter-js').Body;
const Vector = require('matter-js').Vector;
const startGame = Game.startGame;
Game = Game.Game;

function newGame() {
    const game = new Game();
    game.eventSystem.addListener((event) => event.types.includes('KEYPRESS'),(event) => console.log(`Key ${event.data.key} was pressed!`),0);
    game.addScene('main');
    game.activeScene = game.sceneLst['main']
    game.activeScene.addActor('test',{
        renderOps: null,
        physOps: {
            type: 'rectangle',
            x: 200,
            y: 200,
            w: 100,
            h: 100,
            isStatic:false,
        }
    });
    game.activeScene.addActor('floor',{
        renderOps: null,
        physOps: {
            type: 'rectangle',
            x: 100,
            y: 500,
            w: 500,
            h: 1,
            isStatic:true,
        }
    });
    game.eventSystem.addListener((event) => event.types.includes('KEYHOLD'),(event) => {
        let obj = game.activeScene.compLst['test'].physObj;
        switch(event.data.key) {
            case 'w': Body.applyForce(obj,obj.position,Vector.create(0,-0.05*game.engine.deltaTime));
        }
    },0);
    return game;
}

startGame(newGame);
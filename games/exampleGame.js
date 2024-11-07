const Game = require('../server/Game').Game;
const Body = require('matter-js').Body;
const Vector = require('matter-js').Vector;
const startGame = require('../server/Game').startGame;

function newGame() {
    const game = new Game();
    game.stateSystem.addListener((event) => event.types.includes('KEYPRESS'),(event) => console.log(`Key ${event.data.key} was pressed!`),0);
    game.stateSystem.addListener((event) => event.types.includes('MOUSECLICK'),(event) => console.log(`Button ${event.data.name} was clicked!`),0);
    game.addScene('main');
    game.activeScene = game.sceneLst['main'];
    game.activeScene.state.nextMessage = '';
    game.activeScene.addActor('rect',{
        renderOps: {
            svgRender: true,
            type: 'polygon',
        },
        physOps: {
            type: 'rectangle',
            x: 200,
            y: 200,
            w: 100,
            h: 100,
            isStatic:false,
        }
    });
    game.activeScene.addActor('testButton',{
        renderOps: {
            svgRender: false,
            type: 'button',
            text: 'Set Text',
            x:300,
            y:200,
        },
        physOps: {
            noPhys: true
        }
    });
    game.activeScene.addActor('floor',{
        renderOps: {
            svgRender: true,
            type: 'polygon',
        },
        physOps: {
            type: 'rectangle',
            x: 100,
            y: 500,
            w: 500,
            h: 1,
            isStatic:true,
        }
    });
    game.activeScene.addActor('testOutput',{
        renderOps: {
            svgRender: false,
            type: 'textbox',
            text: 'I am a textbox!',
            x:300,
            y:200,
        },
        physOps: {
            noPhys: true
        }
    });
    
    game.activeScene.addActor('testCircle',{
        renderOps: {
            svgRender: true,
            type: 'circle',
        },
        physOps: {
            type: 'circle',
            centerX: 250,
            centerY: 100,
            radius: 10,
            isStatic:false,
        }
    });
    game.activeScene.addActor('testPoly',{
        renderOps: {
            svgRender: true,
            type: 'polygon',
        },
        physOps: {
            type: 'polygon',
            centerX: 250,
            centerY: 100,
            vertices: [{x:200,y:50},{x:250,y:50},{x:200,y:150}],
            isStatic:false,
        }
    });
    game.stateSystem.addListener((event) => event.types.includes('KEYPRESS'),(event) => {
        game.activeScene.state.nextMessage += event.data.key;
    },0);
    game.stateSystem.addListener((event) => event.types.includes('KEYHOLD') && event.data.key == 'w',(event) => {
        const circle = game.activeScene.compLst['testCircle'].physObj;
        Body.applyForce(circle,circle.position,Vector.create(0,-0.001));
    },0);
    game.stateSystem.addListener((event) => event.types.includes('MOUSECLICK'),(event) => {
        game.activeScene.compLst['testOutput'].renderOps.text = game.activeScene.state.nextMessage;
        game.activeScene.state.nextMessage = '';
    },0);
    return game;
}

startGame(newGame);
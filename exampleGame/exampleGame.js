let Game = require('../server/Game');
const startGame = Game.startGame;
Game = Game.Game;

function newGame() {
    const game = new Game();
    game.eventSystem.addListener((event) => event.types.includes('KEYPRESS'),(event) => console.log(`Key ${event.data.key} was pressed!`),0);
    return game;
}

startGame(newGame);
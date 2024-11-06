let Game = require('../server/Game');
const Body = require('matter-js').Body;
const Vector = require('matter-js').Vector;
const startGame = Game.startGame;
Game = Game.Game;

function newGame() {
    const game = new Game();
}
const Engine = require('./Engine.js').Engine;
const startServer = require('./serverSocketInterface.js').startServer;

startServer((socket) => new Engine(socket));
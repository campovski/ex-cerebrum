/**
 * This module handles frontend-backend communication.
 */

const dotenv = require('dotenv');
dotenv.config();

if (!process.env.LICHESS_TOKEN) {
    console.log('No environment variable LICHESS_TOKEN ...');
    process.exit();
}

const app = require('./serverConfig');
const server = require('http').createServer(app);
const socketio = require('socket.io')(server);
const processorEvents = require('./modules/processor');
const c = require('./modules/constants');

processorEvents.on(c.EVENT_PROCESSOR_GAME_START, (data) => {
    console.log('GAME START FROM SERVER.JS');
    socketio.emit(c.EVENT_SOCKET_GAME_START, data);
});

processorEvents.on(c.EVENT_PROCESSOR_UPDATE_BOARD, (data) => {
    console.log(data.move);
    console.log(`MOVE FROM SERVER.JS ${data.move.from} - ${data.move.to}`);
    socketio.emit(c.EVENT_SOCKET_UPDATE_BOARD, data);
});

processorEvents.on(c.EVENT_PROCESSOR_GAME_END, (data) => {
    console.log('GAME ENDED FROM SERVER.JS');
    socketio.emit(c.EVENT_SOCKET_GAME_END, data);
});

socketio.on('connection', () => { console.log('CONNECTION'); });

// Start the server.
const port = process.env.PORT || 3000;
server.listen(port, () => { console.log(`Ex Cerebrum server listening on port ${port}!`); });

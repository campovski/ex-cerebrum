if (!process.env.LICHESS_TOKEN) {
    console.log('No environment variable LICHESS_TOKEN ...');
    process.exit();
}

const express = require('express');
const app = express();
const server = require('http').createServer(app);
const socketio = require('socket.io')(server);

const c = require('./modules/constants');
const nunjucks = require('nunjucks');
const path = require('path');
const processorEvents = require('./modules/processor');
const port = process.env.PORT || 3000;

processorEvents.on(c.EVENT_PROCESSOR_GAME_START, (data) => {
    console.log('GAME START FROM SERVER.JS');
});

processorEvents.on(c.EVENT_PROCESSOR_UPDATE_BOARD, (move) => {
    console.log(`MOVE FROM SERVER.JS ${move.from} - ${move.to}`);
});

processorEvents.on(c.EVENT_PROCESSOR_GAME_END, (data) => {
    console.log('GAME ENDED FROM SERVER.JS');
});

// Configure nunjucks to use express app
nunjucks.configure('views', {
    express: app,
    autoescape: true
});
app.set('view engine', 'html');

app.use('/app/static', express.static(path.join(__dirname, 'static')));

// Routes
app.get('/', (req, res) => res.render('index.html'));
app.get('/game', (req, res) => res.render('game/game.html', { gameId: '22213' }));

// Start the server
app.listen(port, () => { console.log(`Ex Cerebrum server listening on port ${port}!`); });

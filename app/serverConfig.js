const express = require('express');
const app = express();

const nunjucks = require('nunjucks');
const path = require('path');

// Configure nunjucks to use express app
nunjucks.configure('views', {
    express: app,
    autoescape: true
});
app.set('view engine', 'html');

app.use('/app/static', express.static(path.join(__dirname, 'static')));
app.use('/app/dist', express.static(path.join(__dirname, 'dist')));
app.use('/', express.static(path.join(__dirname, 'static/images/chessmen')));

// Routes
app.get('/', (req, res) => res.render('index.html'));
app.get('/game', (req, res) => res.render('game/game.html', { gameId: '22213' }));

module.exports = app;

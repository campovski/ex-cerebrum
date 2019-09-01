const express = require('express');
const nunjucks = require('nunjucks');
const processor = require('./modules/processor');
const port = process.env.PORT || 3000;
const app = express();

// Configure nunjucks to use express app
nunjucks.configure('views', {
    express: app,
    autoescape: true
});
app.set('view engine', 'html');

// Routes
app.get('/', (req, res) => res.render('index.html'));
app.get('/game', (req, res) => res.render('game/game.html', { gameId: '22213' }));
app.get('/test', (req, res) => {});

// Start the server
app.listen(port, () => { console.log(`Ex Cerebrum server listening on port ${port}!`); });

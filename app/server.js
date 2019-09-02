const express = require('express');
const nunjucks = require('nunjucks');
const path = require('path');
require('./modules/processor');
const port = process.env.PORT || 3000;
const app = express();

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

const path = require('path');

module.exports = {
    entry: './static/js/game.js',
    mode: process.env.NODE_ENV || 'development',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'cerebrum.bundle.js'
    }
};

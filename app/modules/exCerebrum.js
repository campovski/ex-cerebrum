const Game = require('./game');

class ExCerebrum {
    constructor(gameData) {
        this.game = new Game(gameData);
    }

    makeMove(move) {
        // make move
    }

    updateAndMakeMove(move) {
        this.game.updateBoard(move);
        this.makeMove();
    }
}

module.exports = ExCerebrum;

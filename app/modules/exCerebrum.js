const Game = require('./game');

class ExCerebrum {
    constructor(gameData) {
        this.game = new Game(gameData);
    }

    makeMove(move) {
        return 'this is my move';
    }

    updateAndMakeMove(move) {
        this.game.updateBoard(move);
        return this.makeMove();
    }
}

module.exports = ExCerebrum;

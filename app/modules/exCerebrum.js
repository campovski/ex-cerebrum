const Game = require('./game');

class ExCerebrum {
    constructor(gameData) {
        this.game = new Game(gameData);
    }

    makeMove() {
        if (this.game.myTurn) {
            console.log(this.game.myTurn, this.game.whiteOnMove);
            this.game.getAvailableMoves();
            const move = this.game.legalMoves[Math.floor(this.game.legalMoves.length * Math.random())];
            return this.game.serializeMove(move);
        }

        return null;
    }

    updateAndMakeMove(move) {
        this.game.updateBoard(move);
        return this.makeMove();
    }
}

module.exports = ExCerebrum;

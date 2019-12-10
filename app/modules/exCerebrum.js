const Game = require('./game');

class ExCerebrum {
    constructor(gameData) {
        this.game = new Game(gameData);
    }

    makeMove() {
        console.log(this.game.myTurn, this.game.whiteOnMove);
        this.game.getAvailableMoves();
        const move = this.game.legalMoves[Math.floor(this.game.legalMoves.length * Math.random())];
        return this.game.serializeMove(move);
    }
}

module.exports = ExCerebrum;

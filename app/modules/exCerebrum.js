const Game = require('./game');
const support = require('./support');

/**
 * Class ExCerebrum. The brains of our chess bot.
 */
class ExCerebrum {
    /**
     * Constructor. Initialize game and make a move if it is our turn.
     *
     * @param {object} gameData - data about the game that will be played
     */
    constructor(gameData) {
        this.game = new Game(gameData);

        if (gameData['white']['id'] === 'excerebrum') {
            this.makeMove();
        }
    }

    /**
     * Make a move. This is the main brains where all the logic happens.
     * Currently it will play a randomly selected move.
     *
     * @returns {string} - move in UCI format
     */
    makeMove() {
        return support.moveToUci(this.game.legalMoves[Math.floor(Math.random() * this.game.legalMoves.length)]);
    }

    /**
     * Update the board and make a move.
     *
     * @param {string} move - move in UCI format
     * @returns {string} - my move in UCI format
     */
    updateAndMakeMove(move) {
        // Update board with opponent's move.
        this.game.updateBoard(move);

        // Find our move and update board with it.
        const myMove = this.makeMove();
        this.game.updateBoard(myMove);

        return myMove;
    }
}

module.exports = ExCerebrum;

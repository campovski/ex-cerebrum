const c = require('./constants');

/**
 * Implementation of chess game. Contains data about players, current position,
 * remaining time of each player, increment.
 */
class Game {
    /**
     * Game constructor. Save important data from game stream.
     *
     * Data looks like this:
     * { id: 'dnLnH9v7',
     *   variant: { key: 'standard', name: 'Standard', short: 'Std' },
     *   clock: { initial: 10800000, increment: 0 },
     *   speed: 'classical',
     *   perf: { name: 'Classical' },
     *   rated: false,
     *   createdAt: 1567110134794,
     *   white:
     *    { id: 'excerebrum',
     *      name: 'ExCerebrum',
     *      title: 'BOT',
     *      rating: 1500,
     *      provisional: true },
     *   black:
     *    { id: 'makedonium',
     *      name: 'Makedonium',
     *      title: null,
     *      rating: 2100,
     *      provisional: true },
     *   initialFen: 'startpos',
     *   type: 'gameFull',
     *   state:
     *    { type: 'gameState',
     *      moves: '',
     *      wtime: 10800000,
     *      btime: 10800000,
     *      winc: 0,
     *      binc: 0,
     *      bdraw: false,
     *      wdraw: false } }
     *
     * @param {object} gameData - contains game data like gameId, TC, variant, etc.
     */
    constructor(gameData) {
        this.initBoard(gameData['variant']['key']);
        this.id = gameData['id'];
        this.timeWhite = gameData['clock']['initial'];
        this.timeBlack = gameData['clock']['initial'];
        this.increment = gameData['clock']['increment'];
        this.isRated = gameData['rated'];
        this.playerWhite = gameData['white'];
        this.playerBlack = gameData['black'];
    }

    /**
     * Convert current position to string for printing.
     *
     * @param {boolean} whiteDown - watch from white's perspective?
     * @returns {string} representation of current position
     */
    toString(whiteDown = true) {
        let str = '';

        if (whiteDown) {
            for (let rank = c.RANK_8; rank >= c.RANK_1; rank--) {
                str += this.board[rank].join('') + '\n';
            }
        } else {
            for (let rank = c.RANK_1; rank <= c.RANK_8; rank++) {
                str += this.board[rank].join('') + '\n';
            }
        }

        return str;
    }

    /**
     * Initializes board as 2D array.
     *
     * @param {string} variant - what variant is being played
     * @returns {void}
     * @throws Error when unknown variant is specified
     */
    initBoard(variant) {
        switch (variant) {
            case 'standard':
            case 'kingOfTheHill':
            case 'antichess':
                this.board = Array.from(Array(8), _ => Array(8).fill(c.EMPTY));

                for (let file = c.FILE_A; file <= c.FILE_H; file++) {
                    this.board[c.RANK_2][file] = c.W_PAWN;
                    this.board[c.RANK_7][file] = c.B_PAWN;
                }

                this.board[c.RANK_1][c.FILE_A] = c.W_ROOK;
                this.board[c.RANK_1][c.FILE_B] = c.W_KNIGHT;
                this.board[c.RANK_1][c.FILE_C] = c.W_BISHOP;
                this.board[c.RANK_1][c.FILE_D] = c.W_QUEEN;
                this.board[c.RANK_1][c.FILE_E] = c.W_KING;
                this.board[c.RANK_1][c.FILE_F] = c.W_BISHOP;
                this.board[c.RANK_1][c.FILE_G] = c.W_KNIGHT;
                this.board[c.RANK_1][c.FILE_H] = c.W_ROOK;

                this.board[c.RANK_8][c.FILE_A] = c.B_ROOK;
                this.board[c.RANK_8][c.FILE_B] = c.B_KNIGHT;
                this.board[c.RANK_8][c.FILE_C] = c.B_BISHOP;
                this.board[c.RANK_8][c.FILE_D] = c.B_QUEEN;
                this.board[c.RANK_8][c.FILE_E] = c.B_KING;
                this.board[c.RANK_8][c.FILE_F] = c.B_BISHOP;
                this.board[c.RANK_8][c.FILE_G] = c.B_KNIGHT;
                this.board[c.RANK_8][c.FILE_H] = c.B_ROOK;
                break;
            case 'racingKings':
                this.board = [];
                break;
            default:
                throw new Error('Unknown variant!');
        }
    }

    /**
     * Updates chessboard for given move (e.g. 'e2e4').
     *
     * @param {string} move - 4 letter string containing move data
     * @returns {void}
     */
    updateBoard(move) {
        const fileFrom = parseFile(move.charAt(0));
        const rankFrom = parseRank(move.charAt(1));
        const fileTo = parseFile(move.charAt(2));
        const rankTo = parseRank(move.charAt(3));

        this.board[rankTo][fileTo] = this.board[rankFrom][fileFrom];
        this.board[rankFrom][fileFrom] = c.EMPTY;
        console.log(this.toString());
    }
}

/**
 * For given Lichess API file notation, convert it to array index.
 *
 * @param {string} file - character from 'a' to 'h'
 * @returns {number} file as array index
 */
function parseFile(file) {
    switch (file) {
        case c.LICHESS_FILE_A:
            return c.FILE_A;
        case c.LICHESS_FILE_B:
            return c.FILE_B;
        case c.LICHESS_FILE_C:
            return c.FILE_C;
        case c.LICHESS_FILE_D:
            return c.FILE_D;
        case c.LICHESS_FILE_E:
            return c.FILE_E;
        case c.LICHESS_FILE_F:
            return c.FILE_F;
        case c.LICHESS_FILE_G:
            return c.FILE_G;
        case c.LICHESS_FILE_H:
            return c.FILE_H;
        default:
            throw new Error('[game.parseFile] Unknown file.');
    }
}

/**
 * Converts Lichess API rank notation (1-8) to 0-based integer.
 *
 * @param {string} rank - character from '1' to '8'
 * @returns {number} rank as array index
 */
function parseRank(rank) {
    return parseInt(rank) - 1;
}

module.exports = Game;

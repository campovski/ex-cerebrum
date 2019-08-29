const c = require('./constants');

class Game {
    constructor(gameData) {
        this.board = this.initBoard(gameData['variant']['key']);
        this.timeWhite = gameData['timeControl']['limit'];
        this.timeBlack = gameData['timeControl']['limit'];
        this.increment = gameData['timeControl']['increment'];
    }

    initBoard(variant) {
        switch (variant) {
            case 'standard':
            case 'kingOfTheHill':
            case 'antichess':
                const board = Array.from(Array(8), _ => Array(8).fill(c.EMPTY));

                for (let file = c.FILE_A; file <= c.FILE_H; file++) {
                    board[c.RANK_2][file] = c.W_PAWN;
                    board[c.RANK_7][file] = c.B_PAWN;
                }

                board[c.RANK_1][c.FILE_A] = c.W_ROOK;
                board[c.RANK_1][c.FILE_B] = c.W_KNIGHT;
                board[c.RANK_1][c.FILE_C] = c.W_BISHOP;
                board[c.RANK_1][c.FILE_D] = c.W_QUEEN;
                board[c.RANK_1][c.FILE_E] = c.W_KING;
                board[c.RANK_1][c.FILE_F] = c.W_BISHOP;
                board[c.RANK_1][c.FILE_G] = c.W_KNIGHT;
                board[c.RANK_1][c.FILE_H] = c.W_ROOK;

                board[c.RANK_7][c.FILE_A] = c.B_ROOK;
                board[c.RANK_7][c.FILE_B] = c.B_KNIGHT;
                board[c.RANK_7][c.FILE_C] = c.B_BISHOP;
                board[c.RANK_7][c.FILE_D] = c.B_QUEEN;
                board[c.RANK_7][c.FILE_E] = c.B_KING;
                board[c.RANK_7][c.FILE_F] = c.B_BISHOP;
                board[c.RANK_7][c.FILE_G] = c.B_KNIGHT;
                board[c.RANK_7][c.FILE_H] = c.B_ROOK;

                return board;

            case 'racingKings':
                return [];
            default:
                throw new Error('Unknown variant!');
        }
    }

    updateBoard(move) {
        const fileFrom = parseFile(move.charAt(0));
        const rankFrom = parseRank(move.charAt(1));
        const fileTo = parseFile(move.charAt(2));
        const rankTo = parseRank(move.charAt(3));

        this.board[rankTo][fileTo] = this.board[rankFrom][fileFrom];
        this.board[rankFrom][fileFrom] = c.EMPTY;
    }
}

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

function parseRank(rank) {
    return parseInt(rank) - 1;
}

module.exports = Game;

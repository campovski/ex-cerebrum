const assert = require('assert');
const c = require('.././app/modules/constants');
const Game = require('.././app/modules/game');

let game;
const gameData = {
    id: 'dnLnH9v7',
    variant: {
        key: 'standard',
        name: 'Standard',
        short: 'Std'
    },
    clock: {
        initial: 10800000,
        increment: 0
    },
    speed: 'classical',
    perf: { name: 'Classical' },
    rated: false,
    createdAt: 1567110134794,
    white: {
        id: 'makedonium',
        name: 'makedonium',
        title: 'BOT',
        rating: 1500,
        provisional: true
    },
    black: {
        id: 'excerebrum',
        name: 'ExCerebrum',
        title: 'BOT',
        rating: 1500,
        provisional: true
    },
    initialFen: 'startpos',
    type: 'gameFull',
    state: {
        type: 'gameState',
        moves: '',
        wtime: 10800000,
        btime: 10800000,
        winc: 0,
        binc: 0,
        bdraw: false,
        wdraw: false
    }
};

describe('Game', () => {
    describe('.isWhiteKingAttacked()', () => {
        beforeEach(() => {
            game = new Game(gameData);
            game.whiteOnMove = true;
            game.setPosition(Array.from(Array(8), _ => Array(8).fill(c.EMPTY)));
            game.kingsPosition.white = {
                file: 4,
                rank: 4
            };
            game.board[game.kingsPosition.white.rank][game.kingsPosition.white.file] = c.W_KING;
        });

        describe('by pawn', () => {
            it('should return true for pawn on NW', () => {
                game.board[game.kingsPosition.white.rank + 1][game.kingsPosition.white.file - 1] = c.B_PAWN;
                assert.strictEqual(game.isWhiteKingAttacked(), true);
            });
            it('should return true for pawn on NE', () => {
                game.board[game.kingsPosition.white.rank + 1][game.kingsPosition.white.file + 1] = c.B_PAWN;
                assert.strictEqual(game.isWhiteKingAttacked(), true);
            });
        });

        describe('by knight', () => {
            it('should return true for knight on NNW', () => {
                game.board[game.kingsPosition.white.rank + 2][game.kingsPosition.white.file - 1] = c.B_KNIGHT;
                assert.strictEqual(game.isWhiteKingAttacked(), true);
            });
            it('should return true for knight on NNE', () => {
                game.board[game.kingsPosition.white.rank + 2][game.kingsPosition.white.file + 1] = c.B_KNIGHT;
                assert.strictEqual(game.isWhiteKingAttacked(), true);
            });
            it('should return true for knight on ENE', () => {
                game.board[game.kingsPosition.white.rank + 1][game.kingsPosition.white.file + 2] = c.B_KNIGHT;
                assert.strictEqual(game.isWhiteKingAttacked(), true);
            });
            it('should return true for knight on ESE', () => {
                game.board[game.kingsPosition.white.rank - 1][game.kingsPosition.white.file + 2] = c.B_KNIGHT;
                assert.strictEqual(game.isWhiteKingAttacked(), true);
            });
            it('should return true for knight on SSE', () => {
                game.board[game.kingsPosition.white.rank - 2][game.kingsPosition.white.file + 1] = c.B_KNIGHT;
                assert.strictEqual(game.isWhiteKingAttacked(), true);
            });
            it('should return true for knight on SSW', () => {
                game.board[game.kingsPosition.white.rank - 2][game.kingsPosition.white.file - 1] = c.B_KNIGHT;
                assert.strictEqual(game.isWhiteKingAttacked(), true);
            });
            it('should return true for knight on WSW', () => {
                game.board[game.kingsPosition.white.rank - 1][game.kingsPosition.white.file - 2] = c.B_KNIGHT;
                assert.strictEqual(game.isWhiteKingAttacked(), true);
            });
            it('should return true for knight on WNW', () => {
                game.board[game.kingsPosition.white.rank + 1][game.kingsPosition.white.file - 2] = c.B_KNIGHT;
                assert.strictEqual(game.isWhiteKingAttacked(), true);
            });
        });

        describe('by bishop', () => {
            it('should return true for unblocked attack from NW', () => {
                game.board[game.kingsPosition.white.rank + 3][game.kingsPosition.white.file - 3] = c.B_BISHOP;
                assert.strictEqual(game.isWhiteKingAttacked(), true);
            });
            it('should return true for unblocked attack from NE', () => {
                game.board[game.kingsPosition.white.rank + 3][game.kingsPosition.white.file + 3] = c.B_BISHOP;
                assert.strictEqual(game.isWhiteKingAttacked(), true);
            });
            it('should return true for unblocked attack from SE', () => {
                game.board[game.kingsPosition.white.rank - 3][game.kingsPosition.white.file + 3] = c.B_BISHOP;
                assert.strictEqual(game.isWhiteKingAttacked(), true);
            });
            it('should return true for unblocked attack from SW', () => {
                game.board[game.kingsPosition.white.rank - 3][game.kingsPosition.white.file - 3] = c.B_BISHOP;
                assert.strictEqual(game.isWhiteKingAttacked(), true);
            });

            it('should return false for blocked attack by white piece from NW', () => {
                game.board[game.kingsPosition.white.rank + 2][game.kingsPosition.white.file - 2] = c.W_PAWN;
                game.board[game.kingsPosition.white.rank + 3][game.kingsPosition.white.file - 3] = c.B_BISHOP;
                assert.strictEqual(game.isWhiteKingAttacked(), false);
            });
            it('should return false for blocked attack by white piece from NE', () => {
                game.board[game.kingsPosition.white.rank + 2][game.kingsPosition.white.file + 2] = c.W_PAWN;
                game.board[game.kingsPosition.white.rank + 3][game.kingsPosition.white.file + 3] = c.B_BISHOP;
                assert.strictEqual(game.isWhiteKingAttacked(), false);
            });
            it('should return false for blocked attack by white piece from SE', () => {
                game.board[game.kingsPosition.white.rank - 2][game.kingsPosition.white.file + 2] = c.W_PAWN;
                game.board[game.kingsPosition.white.rank - 3][game.kingsPosition.white.file + 3] = c.B_BISHOP;
                assert.strictEqual(game.isWhiteKingAttacked(), false);
            });
            it('should return false for blocked attack by white piece from SW', () => {
                game.board[game.kingsPosition.white.rank - 2][game.kingsPosition.white.file - 2] = c.W_PAWN;
                game.board[game.kingsPosition.white.rank - 3][game.kingsPosition.white.file - 3] = c.B_BISHOP;
                assert.strictEqual(game.isWhiteKingAttacked(), false);
            });

            it('should return false for blocked attack by black piece from NW', () => {
                game.board[game.kingsPosition.white.rank + 2][game.kingsPosition.white.file - 2] = c.B_PAWN;
                game.board[game.kingsPosition.white.rank + 3][game.kingsPosition.white.file - 3] = c.B_BISHOP;
                assert.strictEqual(game.isWhiteKingAttacked(), false);
            });
            it('should return false for blocked attack by black piece from NE', () => {
                game.board[game.kingsPosition.white.rank + 2][game.kingsPosition.white.file + 2] = c.B_PAWN;
                game.board[game.kingsPosition.white.rank + 3][game.kingsPosition.white.file + 3] = c.B_BISHOP;
                assert.strictEqual(game.isWhiteKingAttacked(), false);
            });
            it('should return false for blocked attack by black piece from SE', () => {
                game.board[game.kingsPosition.white.rank - 2][game.kingsPosition.white.file + 2] = c.B_PAWN;
                game.board[game.kingsPosition.white.rank - 3][game.kingsPosition.white.file + 3] = c.B_BISHOP;
                assert.strictEqual(game.isWhiteKingAttacked(), false);
            });
            it('should return false for blocked attack by black piece from SW', () => {
                game.board[game.kingsPosition.white.rank - 2][game.kingsPosition.white.file - 2] = c.B_PAWN;
                game.board[game.kingsPosition.white.rank - 3][game.kingsPosition.white.file - 3] = c.B_BISHOP;
                assert.strictEqual(game.isWhiteKingAttacked(), false);
            });
        });

        describe('by rook', () => {
            it('should return true for unblocked attack from N', () => {
                game.board[game.kingsPosition.white.rank + 3][game.kingsPosition.white.file] = c.B_ROOK;
                assert.strictEqual(game.isWhiteKingAttacked(), true);
            });
            it('should return true for unblocked attack from S', () => {
                game.board[game.kingsPosition.white.rank - 3][game.kingsPosition.white.file] = c.B_ROOK;
                assert.strictEqual(game.isWhiteKingAttacked(), true);
            });
            it('should return true for unblocked attack from W', () => {
                game.board[game.kingsPosition.white.rank][game.kingsPosition.white.file - 3] = c.B_ROOK;
                assert.strictEqual(game.isWhiteKingAttacked(), true);
            });
            it('should return true for unblocked attack from E', () => {
                game.board[game.kingsPosition.white.rank][game.kingsPosition.white.file + 3] = c.B_ROOK;
                assert.strictEqual(game.isWhiteKingAttacked(), true);
            });

            it('should return false for blocked attack by white piece from N', () => {
                game.board[game.kingsPosition.white.rank + 2][game.kingsPosition.white.file] = c.W_PAWN;
                game.board[game.kingsPosition.white.rank + 3][game.kingsPosition.white.file] = c.B_ROOK;
                assert.strictEqual(game.isWhiteKingAttacked(), false);
            });
            it('should return false for blocked attack by white piece from S', () => {
                game.board[game.kingsPosition.white.rank - 2][game.kingsPosition.white.file] = c.W_PAWN;
                game.board[game.kingsPosition.white.rank - 3][game.kingsPosition.white.file] = c.B_ROOK;
                assert.strictEqual(game.isWhiteKingAttacked(), false);
            });
            it('should return false for blocked attack by white piece from W', () => {
                game.board[game.kingsPosition.white.rank][game.kingsPosition.white.file - 2] = c.W_PAWN;
                game.board[game.kingsPosition.white.rank][game.kingsPosition.white.file - 3] = c.B_ROOK;
                assert.strictEqual(game.isWhiteKingAttacked(), false);
            });
            it('should return false for blocked attack by white piece from E', () => {
                game.board[game.kingsPosition.white.rank][game.kingsPosition.white.file + 2] = c.W_PAWN;
                game.board[game.kingsPosition.white.rank][game.kingsPosition.white.file + 3] = c.B_ROOK;
                assert.strictEqual(game.isWhiteKingAttacked(), false);
            });

            it('should return false for blocked attack by black piece from N', () => {
                game.board[game.kingsPosition.white.rank + 2][game.kingsPosition.white.file] = c.B_PAWN;
                game.board[game.kingsPosition.white.rank + 3][game.kingsPosition.white.file] = c.B_ROOK;
                assert.strictEqual(game.isWhiteKingAttacked(), false);
            });
            it('should return false for blocked attack by black piece from S', () => {
                game.board[game.kingsPosition.white.rank - 2][game.kingsPosition.white.file] = c.B_PAWN;
                game.board[game.kingsPosition.white.rank - 3][game.kingsPosition.white.file] = c.B_ROOK;
                assert.strictEqual(game.isWhiteKingAttacked(), false);
            });
            it('should return false for blocked attack by black piece from W', () => {
                game.board[game.kingsPosition.white.rank][game.kingsPosition.white.file - 2] = c.B_PAWN;
                game.board[game.kingsPosition.white.rank][game.kingsPosition.white.file - 3] = c.B_ROOK;
                assert.strictEqual(game.isWhiteKingAttacked(), false);
            });
            it('should return false for blocked attack by black piece from E', () => {
                game.board[game.kingsPosition.white.rank][game.kingsPosition.white.file + 2] = c.B_PAWN;
                game.board[game.kingsPosition.white.rank][game.kingsPosition.white.file + 3] = c.B_ROOK;
                assert.strictEqual(game.isWhiteKingAttacked(), false);
            });
        });

        describe('by queen', () => {
            it('should return true for unblocked attack from NW', () => {
                game.board[game.kingsPosition.white.rank + 3][game.kingsPosition.white.file - 3] = c.B_QUEEN;
                assert.strictEqual(game.isWhiteKingAttacked(), true);
            });
            it('should return true for unblocked attack from NE', () => {
                game.board[game.kingsPosition.white.rank + 3][game.kingsPosition.white.file + 3] = c.B_QUEEN;
                assert.strictEqual(game.isWhiteKingAttacked(), true);
            });
            it('should return true for unblocked attack from SE', () => {
                game.board[game.kingsPosition.white.rank - 3][game.kingsPosition.white.file + 3] = c.B_QUEEN;
                assert.strictEqual(game.isWhiteKingAttacked(), true);
            });
            it('should return true for unblocked attack from SW', () => {
                game.board[game.kingsPosition.white.rank - 3][game.kingsPosition.white.file - 3] = c.B_QUEEN;
                assert.strictEqual(game.isWhiteKingAttacked(), true);
            });
            it('should return true for unblocked attack from N', () => {
                game.board[game.kingsPosition.white.rank + 3][game.kingsPosition.white.file] = c.B_QUEEN;
                assert.strictEqual(game.isWhiteKingAttacked(), true);
            });
            it('should return true for unblocked attack from S', () => {
                game.board[game.kingsPosition.white.rank - 3][game.kingsPosition.white.file] = c.B_QUEEN;
                assert.strictEqual(game.isWhiteKingAttacked(), true);
            });
            it('should return true for unblocked attack from W', () => {
                game.board[game.kingsPosition.white.rank][game.kingsPosition.white.file - 3] = c.B_QUEEN;
                assert.strictEqual(game.isWhiteKingAttacked(), true);
            });
            it('should return true for unblocked attack from E', () => {
                game.board[game.kingsPosition.white.rank][game.kingsPosition.white.file + 3] = c.B_QUEEN;
                assert.strictEqual(game.isWhiteKingAttacked(), true);
            });

            it('should return false for blocked attack by white piece from NW', () => {
                game.board[game.kingsPosition.white.rank + 2][game.kingsPosition.white.file - 2] = c.W_PAWN;
                game.board[game.kingsPosition.white.rank + 3][game.kingsPosition.white.file - 3] = c.B_QUEEN;
                assert.strictEqual(game.isWhiteKingAttacked(), false);
            });
            it('should return false for blocked attack by white piece from NE', () => {
                game.board[game.kingsPosition.white.rank + 2][game.kingsPosition.white.file + 2] = c.W_PAWN;
                game.board[game.kingsPosition.white.rank + 3][game.kingsPosition.white.file + 3] = c.B_QUEEN;
                assert.strictEqual(game.isWhiteKingAttacked(), false);
            });
            it('should return false for blocked attack by white piece from SE', () => {
                game.board[game.kingsPosition.white.rank - 2][game.kingsPosition.white.file + 2] = c.W_PAWN;
                game.board[game.kingsPosition.white.rank - 3][game.kingsPosition.white.file + 3] = c.B_QUEEN;
                assert.strictEqual(game.isWhiteKingAttacked(), false);
            });
            it('should return false for blocked attack by white piece from SW', () => {
                game.board[game.kingsPosition.white.rank - 2][game.kingsPosition.white.file - 2] = c.W_PAWN;
                game.board[game.kingsPosition.white.rank - 3][game.kingsPosition.white.file - 3] = c.B_QUEEN;
                assert.strictEqual(game.isWhiteKingAttacked(), false);
            });
            it('should return false for blocked attack by white piece from N', () => {
                game.board[game.kingsPosition.white.rank + 2][game.kingsPosition.white.file] = c.W_PAWN;
                game.board[game.kingsPosition.white.rank + 3][game.kingsPosition.white.file] = c.B_QUEEN;
                assert.strictEqual(game.isWhiteKingAttacked(), false);
            });
            it('should return false for blocked attack by white piece from S', () => {
                game.board[game.kingsPosition.white.rank - 2][game.kingsPosition.white.file] = c.W_PAWN;
                game.board[game.kingsPosition.white.rank - 3][game.kingsPosition.white.file] = c.B_QUEEN;
                assert.strictEqual(game.isWhiteKingAttacked(), false);
            });
            it('should return false for blocked attack by white piece from W', () => {
                game.board[game.kingsPosition.white.rank][game.kingsPosition.white.file - 2] = c.W_PAWN;
                game.board[game.kingsPosition.white.rank][game.kingsPosition.white.file - 3] = c.B_QUEEN;
                assert.strictEqual(game.isWhiteKingAttacked(), false);
            });
            it('should return false for blocked attack by white piece from E', () => {
                game.board[game.kingsPosition.white.rank][game.kingsPosition.white.file + 2] = c.W_PAWN;
                game.board[game.kingsPosition.white.rank][game.kingsPosition.white.file + 3] = c.B_QUEEN;
                assert.strictEqual(game.isWhiteKingAttacked(), false);
            });

            it('should return false for blocked attack by black piece from NW', () => {
                game.board[game.kingsPosition.white.rank + 2][game.kingsPosition.white.file - 2] = c.B_PAWN;
                game.board[game.kingsPosition.white.rank + 3][game.kingsPosition.white.file - 3] = c.B_QUEEN;
                assert.strictEqual(game.isWhiteKingAttacked(), false);
            });
            it('should return false for blocked attack by black piece from NE', () => {
                game.board[game.kingsPosition.white.rank + 2][game.kingsPosition.white.file + 2] = c.B_PAWN;
                game.board[game.kingsPosition.white.rank + 3][game.kingsPosition.white.file + 3] = c.B_QUEEN;
                assert.strictEqual(game.isWhiteKingAttacked(), false);
            });
            it('should return false for blocked attack by black piece from SE', () => {
                game.board[game.kingsPosition.white.rank - 2][game.kingsPosition.white.file + 2] = c.B_PAWN;
                game.board[game.kingsPosition.white.rank - 3][game.kingsPosition.white.file + 3] = c.B_QUEEN;
                assert.strictEqual(game.isWhiteKingAttacked(), false);
            });
            it('should return false for blocked attack by black piece from SW', () => {
                game.board[game.kingsPosition.white.rank - 2][game.kingsPosition.white.file - 2] = c.B_PAWN;
                game.board[game.kingsPosition.white.rank - 3][game.kingsPosition.white.file - 3] = c.B_QUEEN;
                assert.strictEqual(game.isWhiteKingAttacked(), false);
            });
            it('should return false for blocked attack by black piece from N', () => {
                game.board[game.kingsPosition.white.rank + 2][game.kingsPosition.white.file] = c.B_PAWN;
                game.board[game.kingsPosition.white.rank + 3][game.kingsPosition.white.file] = c.B_QUEEN;
                assert.strictEqual(game.isWhiteKingAttacked(), false);
            });
            it('should return false for blocked attack by black piece from S', () => {
                game.board[game.kingsPosition.white.rank - 2][game.kingsPosition.white.file] = c.B_PAWN;
                game.board[game.kingsPosition.white.rank - 3][game.kingsPosition.white.file] = c.B_QUEEN;
                assert.strictEqual(game.isWhiteKingAttacked(), false);
            });
            it('should return false for blocked attack by black piece from W', () => {
                game.board[game.kingsPosition.white.rank][game.kingsPosition.white.file - 2] = c.B_PAWN;
                game.board[game.kingsPosition.white.rank][game.kingsPosition.white.file - 3] = c.B_QUEEN;
                assert.strictEqual(game.isWhiteKingAttacked(), false);
            });
            it('should return false for blocked attack by black piece from E', () => {
                game.board[game.kingsPosition.white.rank][game.kingsPosition.white.file + 2] = c.B_PAWN;
                game.board[game.kingsPosition.white.rank][game.kingsPosition.white.file + 3] = c.B_QUEEN;
                assert.strictEqual(game.isWhiteKingAttacked(), false);
            });
        });
    });

    describe('.isBlackKingAttacked()', () => {
        beforeEach(() => {
            game = new Game(gameData);
            game.whiteOnMove = false;
            game.setPosition(Array.from(Array(8), _ => Array(8).fill(c.EMPTY)));
            game.kingsPosition.black = {
                file: 4,
                rank: 4
            };
            game.board[game.kingsPosition.black.rank][game.kingsPosition.black.file] = c.B_KING;
        });

        describe('by pawn', () => {
            it('should return true for pawn on SW', () => {
                game.board[game.kingsPosition.black.rank - 1][game.kingsPosition.black.file - 1] = c.W_PAWN;
                assert.strictEqual(game.isBlackKingAttacked(), true);
            });
            it('should return true for pawn on SE', () => {
                game.board[game.kingsPosition.black.rank - 1][game.kingsPosition.black.file + 1] = c.W_PAWN;
                assert.strictEqual(game.isBlackKingAttacked(), true);
            });
        });

        describe('by knight', () => {
            it('should return true for knight on NNW', () => {
                game.board[game.kingsPosition.black.rank + 2][game.kingsPosition.black.file - 1] = c.W_KNIGHT;
                assert.strictEqual(game.isBlackKingAttacked(), true);
            });
            it('should return true for knight on NNE', () => {
                game.board[game.kingsPosition.black.rank + 2][game.kingsPosition.black.file + 1] = c.W_KNIGHT;
                assert.strictEqual(game.isBlackKingAttacked(), true);
            });
            it('should return true for knight on ENE', () => {
                game.board[game.kingsPosition.black.rank + 1][game.kingsPosition.black.file + 2] = c.W_KNIGHT;
                assert.strictEqual(game.isBlackKingAttacked(), true);
            });
            it('should return true for knight on ESE', () => {
                game.board[game.kingsPosition.black.rank - 1][game.kingsPosition.black.file + 2] = c.W_KNIGHT;
                assert.strictEqual(game.isBlackKingAttacked(), true);
            });
            it('should return true for knight on SSE', () => {
                game.board[game.kingsPosition.black.rank - 2][game.kingsPosition.black.file + 1] = c.W_KNIGHT;
                assert.strictEqual(game.isBlackKingAttacked(), true);
            });
            it('should return true for knight on SSW', () => {
                game.board[game.kingsPosition.black.rank - 2][game.kingsPosition.black.file - 1] = c.W_KNIGHT;
                assert.strictEqual(game.isBlackKingAttacked(), true);
            });
            it('should return true for knight on WSW', () => {
                game.board[game.kingsPosition.black.rank - 1][game.kingsPosition.black.file - 2] = c.W_KNIGHT;
                assert.strictEqual(game.isBlackKingAttacked(), true);
            });
            it('should return true for knight on WNW', () => {
                game.board[game.kingsPosition.black.rank + 1][game.kingsPosition.black.file - 2] = c.W_KNIGHT;
                assert.strictEqual(game.isBlackKingAttacked(), true);
            });
        });

        describe('by bishop', () => {
            it('should return true for unblocked attack from NW', () => {
                game.board[game.kingsPosition.black.rank + 3][game.kingsPosition.black.file - 3] = c.W_BISHOP;
                assert.strictEqual(game.isBlackKingAttacked(), true);
            });
            it('should return true for unblocked attack from NE', () => {
                game.board[game.kingsPosition.black.rank + 3][game.kingsPosition.black.file + 3] = c.W_BISHOP;
                assert.strictEqual(game.isBlackKingAttacked(), true);
            });
            it('should return true for unblocked attack from SE', () => {
                game.board[game.kingsPosition.black.rank - 3][game.kingsPosition.black.file + 3] = c.W_BISHOP;
                assert.strictEqual(game.isBlackKingAttacked(), true);
            });
            it('should return true for unblocked attack from SW', () => {
                game.board[game.kingsPosition.black.rank - 3][game.kingsPosition.black.file - 3] = c.W_BISHOP;
                assert.strictEqual(game.isBlackKingAttacked(), true);
            });

            it('should return false for blocked attack by black piece from NW', () => {
                game.board[game.kingsPosition.black.rank + 2][game.kingsPosition.black.file - 2] = c.B_PAWN;
                game.board[game.kingsPosition.black.rank + 3][game.kingsPosition.black.file - 3] = c.W_BISHOP;
                assert.strictEqual(game.isBlackKingAttacked(), false);
            });
            it('should return false for blocked attack by black piece from NE', () => {
                game.board[game.kingsPosition.black.rank + 2][game.kingsPosition.black.file + 2] = c.B_PAWN;
                game.board[game.kingsPosition.black.rank + 3][game.kingsPosition.black.file + 3] = c.W_BISHOP;
                assert.strictEqual(game.isBlackKingAttacked(), false);
            });
            it('should return false for blocked attack by black piece from SE', () => {
                game.board[game.kingsPosition.black.rank - 2][game.kingsPosition.black.file + 2] = c.B_PAWN;
                game.board[game.kingsPosition.black.rank - 3][game.kingsPosition.black.file + 3] = c.W_BISHOP;
                assert.strictEqual(game.isBlackKingAttacked(), false);
            });
            it('should return false for blocked attack by black piece from SW', () => {
                game.board[game.kingsPosition.black.rank - 2][game.kingsPosition.black.file - 2] = c.B_PAWN;
                game.board[game.kingsPosition.black.rank - 3][game.kingsPosition.black.file - 3] = c.W_BISHOP;
                assert.strictEqual(game.isBlackKingAttacked(), false);
            });

            it('should return false for blocked attack by white piece from NW', () => {
                game.board[game.kingsPosition.black.rank + 2][game.kingsPosition.black.file - 2] = c.W_PAWN;
                game.board[game.kingsPosition.black.rank + 3][game.kingsPosition.black.file - 3] = c.W_BISHOP;
                assert.strictEqual(game.isBlackKingAttacked(), false);
            });
            it('should return false for blocked attack by white piece from NE', () => {
                game.board[game.kingsPosition.black.rank + 2][game.kingsPosition.black.file + 2] = c.W_PAWN;
                game.board[game.kingsPosition.black.rank + 3][game.kingsPosition.black.file + 3] = c.W_BISHOP;
                assert.strictEqual(game.isBlackKingAttacked(), false);
            });
            it('should return false for blocked attack by white piece from SE', () => {
                game.board[game.kingsPosition.black.rank - 2][game.kingsPosition.black.file + 2] = c.W_PAWN;
                game.board[game.kingsPosition.black.rank - 3][game.kingsPosition.black.file + 3] = c.W_BISHOP;
                assert.strictEqual(game.isBlackKingAttacked(), false);
            });
            it('should return false for blocked attack by white piece from SW', () => {
                game.board[game.kingsPosition.black.rank - 2][game.kingsPosition.black.file - 2] = c.W_PAWN;
                game.board[game.kingsPosition.black.rank - 3][game.kingsPosition.black.file - 3] = c.W_BISHOP;
                assert.strictEqual(game.isBlackKingAttacked(), false);
            });
        });

        describe('by rook', () => {
            it('should return true for unblocked attack from N', () => {
                game.board[game.kingsPosition.black.rank + 3][game.kingsPosition.black.file] = c.W_ROOK;
                assert.strictEqual(game.isBlackKingAttacked(), true);
            });
            it('should return true for unblocked attack from S', () => {
                game.board[game.kingsPosition.black.rank - 3][game.kingsPosition.black.file] = c.W_ROOK;
                assert.strictEqual(game.isBlackKingAttacked(), true);
            });
            it('should return true for unblocked attack from W', () => {
                game.board[game.kingsPosition.black.rank][game.kingsPosition.black.file - 3] = c.W_ROOK;
                assert.strictEqual(game.isBlackKingAttacked(), true);
            });
            it('should return true for unblocked attack from E', () => {
                game.board[game.kingsPosition.black.rank][game.kingsPosition.black.file + 3] = c.W_ROOK;
                assert.strictEqual(game.isBlackKingAttacked(), true);
            });

            it('should return false for blocked attack by black piece from N', () => {
                game.board[game.kingsPosition.black.rank + 2][game.kingsPosition.black.file] = c.B_PAWN;
                game.board[game.kingsPosition.black.rank + 3][game.kingsPosition.black.file] = c.W_ROOK;
                assert.strictEqual(game.isBlackKingAttacked(), false);
            });
            it('should return false for blocked attack by black piece from S', () => {
                game.board[game.kingsPosition.black.rank - 2][game.kingsPosition.black.file] = c.B_PAWN;
                game.board[game.kingsPosition.black.rank - 3][game.kingsPosition.black.file] = c.W_ROOK;
                assert.strictEqual(game.isBlackKingAttacked(), false);
            });
            it('should return false for blocked attack by black piece from W', () => {
                game.board[game.kingsPosition.black.rank][game.kingsPosition.black.file - 2] = c.B_PAWN;
                game.board[game.kingsPosition.black.rank][game.kingsPosition.black.file - 3] = c.W_ROOK;
                assert.strictEqual(game.isBlackKingAttacked(), false);
            });
            it('should return false for blocked attack by black piece from E', () => {
                game.board[game.kingsPosition.black.rank][game.kingsPosition.black.file + 2] = c.B_PAWN;
                game.board[game.kingsPosition.black.rank][game.kingsPosition.black.file + 3] = c.W_ROOK;
                assert.strictEqual(game.isBlackKingAttacked(), false);
            });

            it('should return false for blocked attack by white piece from N', () => {
                game.board[game.kingsPosition.black.rank + 2][game.kingsPosition.black.file] = c.W_PAWN;
                game.board[game.kingsPosition.black.rank + 3][game.kingsPosition.black.file] = c.W_ROOK;
                assert.strictEqual(game.isBlackKingAttacked(), false);
            });
            it('should return false for blocked attack by white piece from S', () => {
                game.board[game.kingsPosition.black.rank - 2][game.kingsPosition.black.file] = c.W_PAWN;
                game.board[game.kingsPosition.black.rank - 3][game.kingsPosition.black.file] = c.W_ROOK;
                assert.strictEqual(game.isBlackKingAttacked(), false);
            });
            it('should return false for blocked attack by white piece from W', () => {
                game.board[game.kingsPosition.black.rank][game.kingsPosition.black.file - 2] = c.W_PAWN;
                game.board[game.kingsPosition.black.rank][game.kingsPosition.black.file - 3] = c.W_ROOK;
                assert.strictEqual(game.isBlackKingAttacked(), false);
            });
            it('should return false for blocked attack by white piece from E', () => {
                game.board[game.kingsPosition.black.rank][game.kingsPosition.black.file + 2] = c.W_PAWN;
                game.board[game.kingsPosition.black.rank][game.kingsPosition.black.file + 3] = c.W_ROOK;
                assert.strictEqual(game.isBlackKingAttacked(), false);
            });
        });

        describe('by queen', () => {
            it('should return true for unblocked attack from NW', () => {
                game.board[game.kingsPosition.black.rank + 3][game.kingsPosition.black.file - 3] = c.W_QUEEN;
                assert.strictEqual(game.isBlackKingAttacked(), true);
            });
            it('should return true for unblocked attack from NE', () => {
                game.board[game.kingsPosition.black.rank + 3][game.kingsPosition.black.file + 3] = c.W_QUEEN;
                assert.strictEqual(game.isBlackKingAttacked(), true);
            });
            it('should return true for unblocked attack from SE', () => {
                game.board[game.kingsPosition.black.rank - 3][game.kingsPosition.black.file + 3] = c.W_QUEEN;
                assert.strictEqual(game.isBlackKingAttacked(), true);
            });
            it('should return true for unblocked attack from SW', () => {
                game.board[game.kingsPosition.black.rank - 3][game.kingsPosition.black.file - 3] = c.W_QUEEN;
                assert.strictEqual(game.isBlackKingAttacked(), true);
            });
            it('should return true for unblocked attack from N', () => {
                game.board[game.kingsPosition.black.rank + 3][game.kingsPosition.black.file] = c.W_QUEEN;
                assert.strictEqual(game.isBlackKingAttacked(), true);
            });
            it('should return true for unblocked attack from S', () => {
                game.board[game.kingsPosition.black.rank - 3][game.kingsPosition.black.file] = c.W_QUEEN;
                assert.strictEqual(game.isBlackKingAttacked(), true);
            });
            it('should return true for unblocked attack from W', () => {
                game.board[game.kingsPosition.black.rank][game.kingsPosition.black.file - 3] = c.W_QUEEN;
                assert.strictEqual(game.isBlackKingAttacked(), true);
            });
            it('should return true for unblocked attack from E', () => {
                game.board[game.kingsPosition.black.rank][game.kingsPosition.black.file + 3] = c.W_QUEEN;
                assert.strictEqual(game.isBlackKingAttacked(), true);
            });

            it('should return false for blocked attack by black piece from NW', () => {
                game.board[game.kingsPosition.black.rank + 2][game.kingsPosition.black.file - 2] = c.B_PAWN;
                game.board[game.kingsPosition.black.rank + 3][game.kingsPosition.black.file - 3] = c.W_QUEEN;
                assert.strictEqual(game.isBlackKingAttacked(), false);
            });
            it('should return false for blocked attack by black piece from NE', () => {
                game.board[game.kingsPosition.black.rank + 2][game.kingsPosition.black.file + 2] = c.B_PAWN;
                game.board[game.kingsPosition.black.rank + 3][game.kingsPosition.black.file + 3] = c.W_QUEEN;
                assert.strictEqual(game.isBlackKingAttacked(), false);
            });
            it('should return false for blocked attack by black piece from SE', () => {
                game.board[game.kingsPosition.black.rank - 2][game.kingsPosition.black.file + 2] = c.B_PAWN;
                game.board[game.kingsPosition.black.rank - 3][game.kingsPosition.black.file + 3] = c.W_QUEEN;
                assert.strictEqual(game.isBlackKingAttacked(), false);
            });
            it('should return false for blocked attack by black piece from SW', () => {
                game.board[game.kingsPosition.black.rank - 2][game.kingsPosition.black.file - 2] = c.B_PAWN;
                game.board[game.kingsPosition.black.rank - 3][game.kingsPosition.black.file - 3] = c.W_QUEEN;
                assert.strictEqual(game.isBlackKingAttacked(), false);
            });
            it('should return false for blocked attack by black piece from N', () => {
                game.board[game.kingsPosition.black.rank + 2][game.kingsPosition.black.file] = c.B_PAWN;
                game.board[game.kingsPosition.black.rank + 3][game.kingsPosition.black.file] = c.W_QUEEN;
                assert.strictEqual(game.isBlackKingAttacked(), false);
            });
            it('should return false for blocked attack by black piece from S', () => {
                game.board[game.kingsPosition.black.rank - 2][game.kingsPosition.black.file] = c.B_PAWN;
                game.board[game.kingsPosition.black.rank - 3][game.kingsPosition.black.file] = c.W_QUEEN;
                assert.strictEqual(game.isBlackKingAttacked(), false);
            });
            it('should return false for blocked attack by black piece from W', () => {
                game.board[game.kingsPosition.black.rank][game.kingsPosition.black.file - 2] = c.B_PAWN;
                game.board[game.kingsPosition.black.rank][game.kingsPosition.black.file - 3] = c.W_QUEEN;
                assert.strictEqual(game.isBlackKingAttacked(), false);
            });
            it('should return false for blocked attack by black piece from E', () => {
                game.board[game.kingsPosition.black.rank][game.kingsPosition.black.file + 2] = c.B_PAWN;
                game.board[game.kingsPosition.black.rank][game.kingsPosition.black.file + 3] = c.W_QUEEN;
                assert.strictEqual(game.isBlackKingAttacked(), false);
            });

            it('should return false for blocked attack by white piece from NW', () => {
                game.board[game.kingsPosition.black.rank + 2][game.kingsPosition.black.file - 2] = c.W_PAWN;
                game.board[game.kingsPosition.black.rank + 3][game.kingsPosition.black.file - 3] = c.W_QUEEN;
                assert.strictEqual(game.isBlackKingAttacked(), false);
            });
            it('should return false for blocked attack by white piece from NE', () => {
                game.board[game.kingsPosition.black.rank + 2][game.kingsPosition.black.file + 2] = c.W_PAWN;
                game.board[game.kingsPosition.black.rank + 3][game.kingsPosition.black.file + 3] = c.W_QUEEN;
                assert.strictEqual(game.isBlackKingAttacked(), false);
            });
            it('should return false for blocked attack by white piece from SE', () => {
                game.board[game.kingsPosition.black.rank - 2][game.kingsPosition.black.file + 2] = c.W_PAWN;
                game.board[game.kingsPosition.black.rank - 3][game.kingsPosition.black.file + 3] = c.W_QUEEN;
                assert.strictEqual(game.isBlackKingAttacked(), false);
            });
            it('should return false for blocked attack by white piece from SW', () => {
                game.board[game.kingsPosition.black.rank - 2][game.kingsPosition.black.file - 2] = c.W_PAWN;
                game.board[game.kingsPosition.black.rank - 3][game.kingsPosition.black.file - 3] = c.W_QUEEN;
                assert.strictEqual(game.isBlackKingAttacked(), false);
            });
            it('should return false for blocked attack by white piece from N', () => {
                game.board[game.kingsPosition.black.rank + 2][game.kingsPosition.black.file] = c.W_PAWN;
                game.board[game.kingsPosition.black.rank + 3][game.kingsPosition.black.file] = c.W_QUEEN;
                assert.strictEqual(game.isBlackKingAttacked(), false);
            });
            it('should return false for blocked attack by white piece from S', () => {
                game.board[game.kingsPosition.black.rank - 2][game.kingsPosition.black.file] = c.W_PAWN;
                game.board[game.kingsPosition.black.rank - 3][game.kingsPosition.black.file] = c.W_QUEEN;
                assert.strictEqual(game.isBlackKingAttacked(), false);
            });
            it('should return false for blocked attack by white piece from W', () => {
                game.board[game.kingsPosition.black.rank][game.kingsPosition.black.file - 2] = c.W_PAWN;
                game.board[game.kingsPosition.black.rank][game.kingsPosition.black.file - 3] = c.W_QUEEN;
                assert.strictEqual(game.isBlackKingAttacked(), false);
            });
            it('should return false for blocked attack by white piece from E', () => {
                game.board[game.kingsPosition.black.rank][game.kingsPosition.black.file + 2] = c.W_PAWN;
                game.board[game.kingsPosition.black.rank][game.kingsPosition.black.file + 3] = c.W_QUEEN;
                assert.strictEqual(game.isBlackKingAttacked(), false);
            });
        });
    });

    describe('.willWhiteKingNotAttackBlack()', () => {
        beforeEach(() => {
            game = new Game(gameData);
            game.whiteOnMove = true;
            game.setPosition(Array.from(Array(8), _ => Array(8).fill(c.EMPTY)));
            game.kingsPosition.black = {
                file: 4,
                rank: 4
            };
            game.board[game.kingsPosition.black.rank][game.kingsPosition.black.file] = c.B_KING;
        });

        it('should return false for black king on one file and one rank away', () => {
            const file = game.kingsPosition.black.file + 1;
            const rank = game.kingsPosition.black.rank + 1;
            assert.strictEqual(game.willWhiteKingNotAttackBlack(file, rank), false);
        });
        it('should return true for black king on one file and two ranks away', () => {
            const file = game.kingsPosition.black.file + 1;
            const rank = game.kingsPosition.black.rank + 2;
            assert.strictEqual(game.willWhiteKingNotAttackBlack(file, rank), true);
        });
        it('should return true for black king on two files and one rank away', () => {
            const file = game.kingsPosition.black.file + 2;
            const rank = game.kingsPosition.black.rank + 1;
            assert.strictEqual(game.willWhiteKingNotAttackBlack(file, rank), true);
        });
    });

    describe('.willBlackKingNotAttackWhite()', () => {
        beforeEach(() => {
            game = new Game(gameData);
            game.whiteOnMove = true;
            game.setPosition(Array.from(Array(8), _ => Array(8).fill(c.EMPTY)));
            game.kingsPosition.white = {
                file: 4,
                rank: 4
            };
            game.board[game.kingsPosition.white.rank][game.kingsPosition.white.file] = c.W_KING;
        });

        it('should return false for white king on one file and one rank away', () => {
            const file = game.kingsPosition.white.file + 1;
            const rank = game.kingsPosition.white.rank + 1;
            assert.strictEqual(game.willBlackKingNotAttackWhite(file, rank), false);
        });
        it('should return true for white king on one file and two ranks away', () => {
            const file = game.kingsPosition.white.file + 1;
            const rank = game.kingsPosition.white.rank + 2;
            assert.strictEqual(game.willBlackKingNotAttackWhite(file, rank), true);
        });
        it('should return true for white king on two files and one rank away', () => {
            const file = game.kingsPosition.white.file + 2;
            const rank = game.kingsPosition.white.rank + 1;
            assert.strictEqual(game.willBlackKingNotAttackWhite(file, rank), true);
        });
    });
});

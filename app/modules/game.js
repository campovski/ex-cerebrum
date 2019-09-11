const c = require('./constants');
const support = require('./support');

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
        /** {Array<Array<string>>} current position */
        this.board = [];

        /** {boolean} is white on move? */
        this.whiteOnMove = true;

        /** {Array<object>} move history */
        this.moveHistory = [];

        /** {Array<Array<number>>} available moves */
        this.availableMoves = [];

        /** {Array<Array<number>>} legal moves, a "subset" of this.availableMoves */
        this.legalMoves = [];

        /** {object} remember kings position */
        this.kingsPosition = {
            white: {
                file: c.FILE_E,
                rank: c.RANK_1
            },
            black: {
                file: c.FILE_E,
                rank: c.RANK_8
            }
        };

        this.initBoard();
        this.getAvailableMoves();

        // Save misc data about game.
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
     * @returns {void}
     * @throws Error when unknown variant is specified
     */
    initBoard() {
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
    }

    /**
     * Updates chessboard for given move (e.g. 'e2e4').
     *
     * @param {string} move - 4 letter string containing move data
     * @returns {void}
     */
    updateBoard(move) {
        const fileFrom = support.parseIndexFile(move.charAt(0));
        const rankFrom = support.parseIndexRank(move.charAt(1));
        const fileTo = support.parseIndexFile(move.charAt(2));
        const rankTo = support.parseIndexRank(move.charAt(3));

        // Remember move.
        this.moveHistory.push({
            fileFrom: fileFrom,
            rankFrom: rankFrom,
            fileTo: fileTo,
            rankTo: rankTo
        });

        // Update kings position if king was moved.
        if (this.board[rankFrom][fileFrom] === c.W_KING || this.board[rankFrom][fileFrom] === c.B_KING) {
            if (this.whiteOnMove) {
                this.kingsPosition.white.file = fileTo;
                this.kingsPosition.white.rank = rankTo;
            } else {
                this.kingsPosition.black.file = fileTo;
                this.kingsPosition.white.rank = rankTo;
            }
        }

        // Make move.
        this.board[rankTo][fileTo] = this.board[rankFrom][fileFrom];
        this.board[rankFrom][fileFrom] = c.EMPTY;
        this.whiteOnMove = !this.whiteOnMove;
        console.log(this.toString());
    }

    /**
     * Get available moves in current position.
     *
     * @returns {void}
     */
    getAvailableMoves() {
        this.availableMoves = new Set();

        if (this.whiteOnMove) {
            this.getAvailableMovesForWhite();
        } else {
            this.getAvailableMovesForBlack();
        }

        this.filterLegalMoves();
    }

    /**
     * Calculate available moves in current position for white.
     *
     * @returns {void}
     */
    getAvailableMovesForWhite() {
        for (let rank = c.RANK_1; rank <= c.RANK_8; rank++) {
            for (let file = c.FILE_A; file <= c.FILE_H; file++) {
                if (support.isPieceNotWhite(this.board[rank][file])) {
                    continue;
                }

                switch (this.board[rank][file]) {
                    case c.W_PAWN:
                        this.getMovesWithWhitePawn(file, rank);
                        break;
                    case c.W_KNIGHT:
                        this.getMovesWithWhiteKnight(file, rank);
                        break;
                    case c.W_BISHOP:
                        this.getMovesWithWhiteBishop(file, rank);
                        break;
                    case c.W_ROOK:
                        this.getMovesWithWhiteRook(file, rank);
                        break;
                    case c.W_QUEEN:
                        this.getMovesWithWhiteQueen(file, rank);
                        break;
                    case c.W_KING:
                        this.getMovesWithWhiteKing(file, rank);
                        break;
                }
            }
        }
    }

    /**
     * Calculate available moves in current position for black.
     *
     * @returns {void}
     */
    getAvailableMovesForBlack() {
        for (let rank = c.RANK_1; rank <= c.RANK_8; rank++) {
            for (let file = c.FILE_A; file <= c.FILE_H; file++) {
                if (support.isPieceNotBlack(this.board[rank][file])) {
                    continue;
                }

                switch (this.board[rank][file]) {
                    case c.B_PAWN:
                        this.getMovesWithBlackPawn(file, rank);
                        break;
                    case c.B_KNIGHT:
                        this.getMovesWithBlackKnight(file, rank);
                        break;
                    case c.B_BISHOP:
                        this.getMovesWithBlackBishop(file, rank);
                        break;
                    case c.B_ROOK:
                        this.getMovesWithBlackRook(file, rank);
                        break;
                    case c.B_QUEEN:
                        this.getMovesWithBlackQueen(file, rank);
                        break;
                    case c.B_KING:
                        this.getMovesWithBlackKing(file, rank);
                        break;
                }
            }
        }
    }

    /**
     * Get moves with white pawn on field "file,rank".
     * Append moves to this.availableMoves.
     *
     * @param {number} file - index of file
     * @param {number} rank - index of rank
     * @returns {void}
     */
    getMovesWithWhitePawn(file, rank) {
        // Advance one rank.
        if (this.board[rank + 1][file] === c.EMPTY) {
            this.availableMoves.push([file, rank, file, rank + 1]);
        }

        // Advance two ranks if in starting position.
        if (rank === c.RANK_2 &&
            this.board[rank + 1][file] === c.EMPTY &&
            this.board[rank + 2][file] === c.EMPTY) {
            this.availableMoves.push([file, rank, file, rank + 2]);
        }

        // Capture enemy piece diagonally.
        if (file !== c.FILE_A && support.isPieceBlack(this.board[rank + 1][file - 1])) {
            this.availableMoves.push([file, rank, file - 1, rank + 1]);
        }
        if (file !== c.FILE_H && support.isPieceBlack(this.board[rank + 1][file + 1])) {
            this.availableMoves.push([file, rank, file + 1, rank + 1]);
        }

        // En passant.
        if (this.moveHistory.length > 1) {
            const lastMove = this.moveHistory[this.moveHistory.length - 1];
            if (this.board[lastMove.rankTo][lastMove.fileTo] === c.B_PAWN &&
                lastMove.rankTo - lastMove.rankFrom === 2 &&
                rank === lastMove.rankTo &&
                (file === lastMove.fileTo + 1 || file === lastMove.fileTo - 1)) {
                this.availableMoves.push([file, rank, lastMove.fileTo, rank + 1]);
            }
        }
    }

    /**
     * Get moves with black pawn on field "file,rank".
     * Append moves to this.availableMoves.
     *
     * @param {number} file - index of file
     * @param {number} rank - index of rank
     * @returns {void}
     */
    getMovesWithBlackPawn(file, rank) {
        // Advance one rank.
        if (this.board[rank - 1][file] === c.EMPTY) {
            this.availableMoves.push([file, rank, file, rank - 1]);
        }

        // Advance two ranks if in starting position.
        if (rank === c.RANK_7 &&
            this.board[rank - 1][file] === c.EMPTY &&
            this.board[rank - 2][file] === c.EMPTY) {
            this.availableMoves.push([file, rank, file, rank - 2]);
        }

        // Capture enemy piece diagonally.
        if (file !== c.FILE_A && support.isPieceWhite(this.board[rank - 1][file - 1])) {
            this.availableMoves.push([file, rank, file - 1, rank - 1]);
        }
        if (file !== c.FILE_H && support.isPieceWhite(this.board[rank - 1][file + 1])) {
            this.availableMoves.push([file, rank, file + 1, rank - 1]);
        }

        // En passant.
        if (this.moveHistory.length > 1) {
            const lastMove = this.moveHistory[this.moveHistory.length - 1];
            if (this.board[lastMove.rankTo][lastMove.fileTo] === c.W_PAWN &&
                lastMove.rankTo - lastMove.rankFrom === 2 &&
                rank === lastMove.rankTo &&
                (file === lastMove.fileTo + 1 || file === lastMove.fileTo - 1)) {
                this.availableMoves.push([file, rank, lastMove.fileTo, rank - 1]);
            }
        }
    }

    /**
     * Get moves with white knight on field "file,rank".
     * Append moves to this.availableMoves.
     *
     * @param {number} file - index of file
     * @param {number} rank - index of rank
     * @returns {void}
     */
    getMovesWithWhiteKnight(file, rank) {
        // North left and right.
        if (rank <= c.RANK_6) {
            if (file >= c.FILE_B && support.isPieceNotWhite(this.board[rank + 2][file - 1])) {
                this.availableMoves.push([file, rank, file - 1, rank + 2]);
            }
            if (file <= c.FILE_G && support.isPieceNotWhite(this.board[rank + 2][file + 1])) {
                this.availableMoves.push([file, rank, file + 1, rank + 2]);
            }
        }

        // South left and right.
        if (rank >= c.RANK_3) {
            if (file >= c.FILE_B && support.isPieceNotWhite(this.board[rank - 2][file - 1])) {
                this.availableMoves.push([file, rank, file - 1, rank - 2]);
            }
            if (file <= c.FILE_G && support.isPieceNotWhite(this.board[rank - 2][file + 1])) {
                this.availableMoves.push([file, rank, file + 1, rank - 2]);
            }
        }

        // East up and down.
        if (file <= c.FILE_F) {
            if (rank <= c.RANK_7 && support.isPieceNotWhite(this.board[rank + 1][file + 2])) {
                this.availableMoves.push([file, rank, file + 2, rank + 1]);
            }
            if (rank >= c.RANK_2 && support.isPieceNotWhite(this.board[rank - 1][file + 2])) {
                this.availableMoves.push([file, rank, file + 2, rank - 1]);
            }
        }

        // West up and down.
        if (file >= c.FILE_C) {
            if (rank <= c.RANK_7 && support.isPieceNotWhite(this.board[rank + 1][file - 2])) {
                this.availableMoves.push([file, rank, file - 2, rank + 1]);
            }
            if (rank >= c.RANK_2 && support.isPieceNotWhite(this.board[rank - 1][file - 2])) {
                this.availableMoves.push([file, rank, file - 2, rank - 1]);
            }
        }
    }

    /**
     * Get moves with black knight on field "file,rank".
     * Append moves to this.availableMoves.
     *
     * @param {number} file - index of file
     * @param {number} rank - index of rank
     * @returns {void}
     */
    getMovesWithBlackKnight(file, rank) {
        // North left and right.
        if (rank <= c.RANK_6) {
            if (file >= c.FILE_B && support.isPieceNotBlack(this.board[rank + 2][file - 1])) {
                this.availableMoves.push([file, rank, file - 1, rank + 2]);
            }
            if (file <= c.FILE_G && support.isPieceNotBlack(this.board[rank + 2][file + 1])) {
                this.availableMoves.push([file, rank, file + 1, rank + 2]);
            }
        }

        // South left and right.
        if (rank >= c.RANK_3) {
            if (file >= c.FILE_B && support.isPieceNotBlack(this.board[rank - 2][file - 1])) {
                this.availableMoves.push([file, rank, file - 1, rank - 2]);
            }
            if (file <= c.FILE_G && support.isPieceNotBlack(this.board[rank - 2][file + 1])) {
                this.availableMoves.push([file, rank, file + 1, rank - 2]);
            }
        }

        // East up and down.
        if (file <= c.FILE_F) {
            if (rank <= c.RANK_7 && support.isPieceNotBlack(this.board[rank + 1][file + 2])) {
                this.availableMoves.push([file, rank, file + 2, rank + 1]);
            }
            if (rank >= c.RANK_2 && support.isPieceNotBlack(this.board[rank - 1][file + 2])) {
                this.availableMoves.push([file, rank, file + 2, rank - 1]);
            }
        }

        // West up and down.
        if (file >= c.FILE_C) {
            if (rank <= c.RANK_7 && support.isPieceNotBlack(this.board[rank + 1][file - 2])) {
                this.availableMoves.push([file, rank, file - 2, rank + 1]);
            }
            if (rank >= c.RANK_2 && support.isPieceNotBlack(this.board[rank - 1][file - 2])) {
                this.availableMoves.push([file, rank, file - 2, rank - 1]);
            }
        }
    }

    /**
     * Get moves with white bishop on field "file,rank".
     * Append them to this.availableMoves.
     *
     * @param {number} file - index of file
     * @param {number} rank - index of rank
     * @returns {void}
     */
    getMovesWithWhiteBishop(file, rank) {
        // NW
        for (let dist = 1; file - dist >= c.FILE_A && rank + dist <= c.RANK_8; dist++) {
            // If there is white piece, this diagonal is blocked.
            if (support.isPieceWhite(this.board[rank + dist][file - dist])) {
                break;
            }

            // Else we add the field to available moves.
            this.availableMoves.push([file, rank, file - dist, rank + dist]);

            // And if it is a black piece, the diagonal is blocked from here on.
            // Since we now that nonempty field is not white from the if statement
            // above, this if condition is safe.
            if (this.board[rank + dist][file - dist] !== c.EMPTY) {
                break;
            }
        }

        // SW
        for (let dist = 1; file - dist >= c.FILE_A && rank - dist >= c.RANK_1; dist++) {
            // If there is white piece, this diagonal is blocked.
            if (support.isPieceWhite(this.board[rank - dist][file - dist])) {
                break;
            }

            // Else we add the field to available moves.
            this.availableMoves.push([file, rank, file - dist, rank - dist]);

            // And if it is a black piece, the diagonal is blocked from here on.
            // Since we now that nonempty field is not white from the if statement
            // above, this if condition is safe.
            if (this.board[rank - dist][file - dist] !== c.EMPTY) {
                break;
            }
        }

        // SE
        for (let dist = 1; file + dist <= c.FILE_H && rank - dist >= c.RANK_1; dist++) {
            // If there is white piece, this diagonal is blocked.
            if (support.isPieceWhite(this.board[rank - dist][file + dist])) {
                break;
            }

            // Else we add the field to available moves.
            this.availableMoves.push([file, rank, file + dist, rank - dist]);

            // And if it is a black piece, the diagonal is blocked from here on.
            // Since we now that nonempty field is not white from the if statement
            // above, this if condition is safe.
            if (this.board[rank - dist][file + dist] !== c.EMPTY) {
                break;
            }
        }

        // NE
        for (let dist = 1; file + dist <= c.FILE_H && rank + dist <= c.RANK_8; dist++) {
            // If there is white piece, this diagonal is blocked.
            if (support.isPieceWhite(this.board[rank + dist][file + dist])) {
                break;
            }

            // Else we add the field to available moves.
            this.availableMoves.push([file, rank, file + dist, rank + dist]);

            // And if it is a black piece, the diagonal is blocked from here on.
            // Since we now that nonempty field is not white from the if statement
            // above, this if condition is safe.
            if (this.board[rank + dist][file + dist] !== c.EMPTY) {
                break;
            }
        }
    }

    /**
     * Get moves with black bishop on field "file,rank".
     * Append them to this.availableMoves.
     *
     * @param {number} file - index of file
     * @param {number} rank - index of rank
     * @returns {void}
     */
    getMovesWithBlackBishop(file, rank) {
        // NW
        for (let dist = 1; file - dist >= c.FILE_A && rank + dist <= c.RANK_8; dist++) {
            // If there is black piece, this diagonal is blocked.
            if (support.isPieceBlack(this.board[rank + dist][file - dist])) {
                break;
            }

            // Else we add the field to available moves.
            this.availableMoves.push([file, rank, file - dist, rank + dist]);

            // And if it is a white piece, the diagonal is blocked from here on.
            // Since we now that nonempty field is not black from the if statement
            // above, this if condition is safe.
            if (this.board[rank + dist][file - dist] !== c.EMPTY) {
                break;
            }
        }

        // SW
        for (let dist = 1; file - dist >= c.FILE_A && rank - dist >= c.RANK_1; dist++) {
            // If there is black piece, this diagonal is blocked.
            if (support.isPieceBlack(this.board[rank - dist][file - dist])) {
                break;
            }

            // Else we add the field to available moves.
            this.availableMoves.push([file, rank, file - dist, rank - dist]);

            // And if it is a white piece, the diagonal is blocked from here on.
            // Since we now that nonempty field is not black from the if statement
            // above, this if condition is safe.
            if (this.board[rank - dist][file - dist] !== c.EMPTY) {
                break;
            }
        }

        // SE
        for (let dist = 1; file + dist <= c.FILE_H && rank - dist >= c.RANK_1; dist++) {
            // If there is black piece, this diagonal is blocked.
            if (support.isPieceBlack(this.board[rank - dist][file + dist])) {
                break;
            }

            // Else we add the field to available moves.
            this.availableMoves.push([file, rank, file + dist, rank - dist]);

            // And if it is a white piece, the diagonal is blocked from here on.
            // Since we now that nonempty field is not black from the if statement
            // above, this if condition is safe.
            if (this.board[rank - dist][file + dist] !== c.EMPTY) {
                break;
            }
        }

        // NE
        for (let dist = 1; file + dist <= c.FILE_H && rank + dist <= c.RANK_8; dist++) {
            // If there is black piece, this diagonal is blocked.
            if (support.isPieceBlack(this.board[rank + dist][file + dist])) {
                break;
            }

            // Else we add the field to available moves.
            this.availableMoves.push([file, rank, file + dist, rank + dist]);

            // And if it is a white piece, the diagonal is blocked from here on.
            // Since we now that nonempty field is not black from the if statement
            // above, this if condition is safe.
            if (this.board[rank + dist][file + dist] !== c.EMPTY) {
                break;
            }
        }
    }

    /**
     * Get moves with white rook on field "file,rank".
     * Append them to this.availableMoves.
     *
     * @param {number} file - index of file
     * @param {number} rank - index of rank
     * @returns {void}
     */
    getMovesWithWhiteRook(file, rank) {
        // N
        for (let dist = 1; rank + dist <= c.RANK_8; dist++) {
            // If there is white piece, this file is blocked.
            if (support.isPieceWhite(this.board[rank + dist][file])) {
                break;
            }

            // Else we add the field to available moves.
            this.availableMoves.push([file, rank, file, rank + dist]);

            // And if it is a black piece, the file is blocked from here on.
            // Since we now that nonempty field is not white from the if statement
            // above, this if condition is safe.
            if (this.board[rank + dist][file] !== c.EMPTY) {
                break;
            }
        }

        // W
        for (let dist = 1; file - dist >= c.FILE_A; dist++) {
            // If there is white piece, this rank is blocked.
            if (support.isPieceWhite(this.board[rank][file - dist])) {
                break;
            }

            // Else we add the field to available moves.
            this.availableMoves.push([file, rank, file - dist, rank]);

            // And if it is a black piece, the rank is blocked from here on.
            // Since we now that nonempty field is not white from the if statement
            // above, this if condition is safe.
            if (this.board[rank][file - dist] !== c.EMPTY) {
                break;
            }
        }

        // S
        for (let dist = 1; rank - dist >= c.RANK_1; dist++) {
            // If there is white piece, this file is blocked.
            if (support.isPieceWhite(this.board[rank - dist][file])) {
                break;
            }

            // Else we add the field to available moves.
            this.availableMoves.push([file, rank, file, rank - dist]);

            // And if it is a black piece, the file is blocked from here on.
            // Since we now that nonempty field is not white from the if statement
            // above, this if condition is safe.
            if (this.board[rank - dist][file] !== c.EMPTY) {
                break;
            }
        }

        // E
        for (let dist = 1; file + dist <= c.FILE_H; dist++) {
            // If there is white piece, this rank is blocked.
            if (support.isPieceWhite(this.board[rank][file + dist])) {
                break;
            }

            // Else we add the field to available moves.
            this.availableMoves.push([file, rank, file + dist, rank]);

            // And if it is a black piece, the rank is blocked from here on.
            // Since we now that nonempty field is not white from the if statement
            // above, this if condition is safe.
            if (this.board[rank][file + dist] !== c.EMPTY) {
                break;
            }
        }
    }

    /**
     * Get moves with black rook on field "file,rank".
     * Append them to this.availableMoves.
     *
     * @param {number} file - index of file
     * @param {number} rank - index of rank
     * @returns {void}
     */
    getMovesWithBlackRook(file, rank) {
        // N
        for (let dist = 1; rank + dist <= c.RANK_8; dist++) {
            // If there is black piece, this file is blocked.
            if (support.isPieceBlack(this.board[rank + dist][file])) {
                break;
            }

            // Else we add the field to available moves.
            this.availableMoves.push([file, rank, file, rank + dist]);

            // And if it is a white piece, the file is blocked from here on.
            // Since we now that nonempty field is not black from the if statement
            // above, this if condition is safe.
            if (this.board[rank + dist][file] !== c.EMPTY) {
                break;
            }
        }

        // W
        for (let dist = 1; file - dist >= c.FILE_A; dist++) {
            // If there is black piece, this rank is blocked.
            if (support.isPieceBlack(this.board[rank][file - dist])) {
                break;
            }

            // Else we add the field to available moves.
            this.availableMoves.push([file, rank, file - dist, rank]);

            // And if it is a white piece, the rank is blocked from here on.
            // Since we now that nonempty field is not black from the if statement
            // above, this if condition is safe.
            if (this.board[rank][file - dist] !== c.EMPTY) {
                break;
            }
        }

        // S
        for (let dist = 1; rank - dist >= c.RANK_1; dist++) {
            // If there is black piece, this file is blocked.
            if (support.isPieceBlack(this.board[rank - dist][file])) {
                break;
            }

            // Else we add the field to available moves.
            this.availableMoves.push([file, rank, file, rank - dist]);

            // And if it is a white piece, the file is blocked from here on.
            // Since we now that nonempty field is not black from the if statement
            // above, this if condition is safe.
            if (this.board[rank - dist][file] !== c.EMPTY) {
                break;
            }
        }

        // E
        for (let dist = 1; file + dist <= c.FILE_H; dist++) {
            // If there is black piece, this rank is blocked.
            if (support.isPieceBlack(this.board[rank][file + dist])) {
                break;
            }

            // Else we add the field to available moves.
            this.availableMoves.push([file, rank, file + dist, rank]);

            // And if it is a white piece, the rank is blocked from here on.
            // Since we now that nonempty field is not black from the if statement
            // above, this if condition is safe.
            if (this.board[rank][file + dist] !== c.EMPTY) {
                break;
            }
        }
    }

    /**
     * Get moves for white queen on field "file,rank".
     * Since queen moves as bishop and rook combined with
     * no other special moves, we can get queen moves as
     * there were a bishop and a rook on field "file, rank".
     *
     * @param {number} file - index of file
     * @param {number} rank - index of rank
     * @returns {void}
     */
    getMovesWithWhiteQueen(file, rank) {
        this.getMovesWithWhiteBishop(file, rank);
        this.getMovesWithWhiteRook(file, rank);
    }

    /**
     * Get moves for black queen on field "file,rank".
     * Since queen moves as bishop and rook combined with
     * no other special moves, we can get queen moves as
     * there were a bishop and a rook on field "file, rank".
     *
     * @param {number} file - index of file
     * @param {number} rank - index of rank
     * @returns {void}
     */
    getMovesWithBlackQueen(file, rank) {
        this.getMovesWithBlackBishop(file, rank);
        this.getMovesWithBlackRook(file, rank);
    }

    /**
     * Get moves with white king on the field "file,rank".
     * Append moves to this.availableMoves.
     *
     * @param {number} file - index of file
     * @param {number} rank - index of rank
     * @returns {void}
     */
    getMovesWithWhiteKing(file, rank) {
        // NW, N, NE
        if (rank <= c.RANK_7) {
            if (file >= c.FILE_B && support.isPieceNotWhite(this.board[rank + 1][file - 1]) && this.willWhiteKingNotAttackBlack(file - 1, rank + 1)) {
                this.availableMoves.push([file, rank, file - 1, rank + 1]);
            }

            if (support.isPieceNotWhite(this.board[rank + 1][file]) && this.willWhiteKingNotAttackBlack(file, rank + 1)) {
                this.availableMoves.push([file, rank, file, rank + 1]);
            }

            if (file <= c.FILE_G && support.isPieceNotWhite(this.board[rank + 1][file + 1]) && this.willWhiteKingNotAttackBlack(file + 1, rank + 1)) {
                this.availableMoves.push([file, rank, file + 1, rank + 1]);
            }
        }

        // SW, S, SE
        if (rank >= c.RANK_2) {
            if (file >= c.FILE_B && support.isPieceNotWhite(this.board[rank - 1][file - 1]) && this.willWhiteKingNotAttackBlack(file - 1, rank - 1)) {
                this.availableMoves.push([file, rank, file - 1, rank - 1]);
            }

            if (support.isPieceNotWhite(this.board[rank - 1][file]) && this.willWhiteKingNotAttackBlack(file, rank - 1)) {
                this.availableMoves.push([file, rank, file, rank - 1]);
            }

            if (file <= c.FILE_G && support.isPieceNotWhite(this.board[rank - 1][file + 1]) && this.willWhiteKingNotAttackBlack(file + 1, rank - 1)) {
                this.availableMoves.push([file, rank, file + 1, rank - 1]);
            }
        }

        // W, E
        if (file >= c.FILE_B && support.isPieceNotWhite(this.board[rank][file - 1]) && this.willWhiteKingNotAttackBlack(file - 1, rank)) {
            this.availableMoves.push([file, rank, file - 1, rank]);
        }
        if (file <= c.FILE_G && support.isPieceNotWhite(this.board[rank][file + 1]) && this.willWhiteKingNotAttackBlack(file + 1, rank)) {
            this.availableMoves.push([file, rank, file + 1, rank]);
        }
    }

    /**
     * Get moves with black king on the field "file,rank".
     * Append moves to this.availableMoves.
     *
     * @param {number} file - index of file
     * @param {number} rank - index of rank
     * @returns {void}
     */
    getMovesWithBlackKing(file, rank) {
        // NW, N, NE
        if (rank <= c.RANK_7) {
            if (file >= c.FILE_B && support.isPieceNotBlack(this.board[rank + 1][file - 1]) && this.willBlackKingNotAttackWhite(file - 1, rank + 1)) {
                this.availableMoves.push([file, rank, file - 1, rank + 1]);
            }

            if (support.isPieceNotBlack(this.board[rank + 1][file]) && this.willBlackKingNotAttackWhite(file, rank + 1)) {
                this.availableMoves.push([file, rank, file, rank + 1]);
            }

            if (file <= c.FILE_G && support.isPieceNotBlack(this.board[rank + 1][file + 1]) && this.willBlackKingNotAttackWhite(file + 1, rank + 1)) {
                this.availableMoves.push([file, rank, file + 1, rank + 1]);
            }
        }

        // SW, S, SE
        if (rank >= c.RANK_2) {
            if (file >= c.FILE_B && support.isPieceNotBlack(this.board[rank - 1][file - 1]) && this.willBlackKingNotAttackWhite(file - 1, rank - 1)) {
                this.availableMoves.push([file, rank, file - 1, rank - 1]);
            }

            if (support.isPieceNotBlack(this.board[rank - 1][file]) && this.willBlackKingNotAttackWhite(file, rank - 1)) {
                this.availableMoves.push([file, rank, file, rank - 1]);
            }

            if (file <= c.FILE_G && support.isPieceNotBlack(this.board[rank - 1][file + 1]) && this.willBlackKingNotAttackWhite(file + 1, rank - 1)) {
                this.availableMoves.push([file, rank, file + 1, rank - 1]);
            }
        }

        // W, E
        if (file >= c.FILE_B && support.isPieceNotBlack(this.board[rank][file - 1]) && this.willWhiteKingNotAttackBlack(file - 1, rank)) {
            this.availableMoves.push([file, rank, file - 1, rank]);
        }
        if (file <= c.FILE_G && support.isPieceNotBlack(this.board[rank][file + 1]) && this.willBlackKingNotAttackWhite(file + 1, rank)) {
            this.availableMoves.push([file, rank, file + 1, rank]);
        }
    }

    /**
     * Check if white king's new position will be away from black king
     * because kings cannot attack each other.
     *
     * @param {number} newFile - index of file white king wants to move to
     * @param {number} newRank - index of rank white king wants to move to
     * @returns {boolean} is white king not by the black one
     */
    willWhiteKingNotAttackBlack(newFile, newRank) {
        return !(Math.abs(this.kingsPosition.black.file - newFile) < 2 && Math.abs(this.kingsPosition.black.rank - newRank) < 2);
    }

    /**
     * Check if black king's new position will be away from white king
     * because kings cannot attack each other.
     *
     * @param {number} newFile - index of file black king wants to move to
     * @param {number} newRank - index of rank black king wants to move to
     * @returns {boolean} is black king not by the white one
     */
    willBlackKingNotAttackWhite(newFile, newRank) {
        return !(Math.abs(this.kingsPosition.white.file - newFile) < 2 && Math.abs(this.kingsPosition.white.rank - newRank) < 2);
    }

    /**
     * Remove all illegal moves from this.availableMoves.
     *
     * @returns {void}
     */
    filterLegalMoves() {
        this.availableMoves.forEach((move) => {
            if (this.isMoveLegal(move)) {
                this.legalMoves.push(move);
            }
        });
    }

    /**
     * Check if move will leave king in check or expose it to check.
     *
     * @param {Array<number>} move - 4D vector
     * @returns {boolean} is move legal?
     */
    isMoveLegal(move) {
        // Initialize return value to false, better safe then sorry.
        let isLegal = false;

        // Mock make move.
        if (this.board[move[1]][move[0]] === c.W_KING) {
            this.kingsPosition.white.file = move[2];
            this.kingsPosition.white.rank = move[3];
        } else if (this.board[move[1]][move[0]] === c.B_KING) {
            this.kingsPosition.black.file = move[2];
            this.kingsPosition.black.rank = move[3];
        }
        this.board[move[3]][move[2]] = this.board[move[1]][move[0]];
        this.board[move[1]][move[0]] = c.EMPTY;

        // Check if king of the player on turn would be under attack after move.
        if (this.whiteOnMove) {
            if (!this.isWhiteKingAttacked()) {
                isLegal = true;
            }
        } else {
            if (!this.isBlackKingAttacked()) {
                isLegal = true;
            }
        }

        // Redo the mock move.
        this.board[move[1][0]] = this.board[move[3]][move[2]];
        this.board[move[3]][move[2]] = c.EMPTY;
        if (this.board[move[1]][move[0]] === c.W_KING) {
            this.kingsPosition.white.file = move[0];
            this.kingsPosition.white.rank = move[1];
        } else if (this.board[move[1]][move[0]] === c.B_KING) {
            this.kingsPosition.black.file = move[0];
            this.kingsPosition.black.rank = move[1];
        }

        return isLegal;
    }

    /**
     * Check if white king is attacked in current position.
     *
     * @returns {boolean} is white king under attack
     */
    isWhiteKingAttacked() {
        const file = this.kingsPosition.white.file;
        const rank = this.kingsPosition.white.rank;

        // Attacked by pawn?
        if (rank <= c.RANK_6 && ((file >= c.FILE_B && this.board[file - 1][rank + 1] === c.B_PAWN) || (file <= c.FILE_G && this.board[file + 1][rank + 1] === c.B_PAWN))) {
            return true;
        }

        // Attacked by knight?
        if ((rank <= c.RANK_6 && ((file >= c.FILE_B && this.board[rank + 2][file - 1] === c.B_KNIGHT) || (file <= c.FILE_G && this.board[rank + 2][file + 1] === c.B_KNIGHT))) ||
            (rank >= c.RANK_3 && ((file >= c.FILE_B && this.board[rank - 2][file - 1] === c.B_KNIGHT) || (file <= c.FILE_G && this.board[rank - 2][file + 1] === c.B_KNIGHT))) ||
            (file >= c.FILE_C && ((rank >= c.RANK_2 && this.board[rank - 1][file - 2] === c.B_KNIGHT) || (rank <= c.RANK_7 && this.board[rank + 1][file - 2] === c.B_KNIGHT))) ||
            (file <= c.FILE_F && ((rank <= c.RANK_7 && this.board[rank + 1][file - 2] === c.B_KNIGHT) || (rank <= c.RANK_7 && this.board[rank + 1][file + 2] === c.B_KNIGHT)))) {
            return true;
        }

        // Attacked by bishop or queen diagonally?
        for (let dist = 1; file - dist >= c.FILE_A && rank + dist <= c.RANK_8; dist++) { // from north-west
            if (support.isPieceWhite(this.board[rank + dist][file - dist])) {
                break;
            }
            if (this.board[rank + dist][file - dist] === c.B_BISHOP || this.board[rank + dist][file - dist] === c.B_QUEEN) {
                return true;
            }
        }
        for (let dist = 1; file - dist >= c.FILE_A && rank - dist >= c.RANK_1; dist++) { // from south-west
            if (support.isPieceWhite(this.board[rank - dist][file - dist])) {
                break;
            }
            if (this.board[rank - dist][file - dist] === c.B_BISHOP || this.board[rank - dist][file - dist] === c.B_QUEEN) {
                return true;
            }
        }
        for (let dist = 1; file + dist <= c.FILE_H && rank - dist >= c.RANK_1; dist++) { // from south-east
            if (support.isPieceWhite(this.board[rank - dist][file + dist])) {
                break;
            }
            if (this.board[rank - dist][file + dist] === c.B_BISHOP || this.board[rank - dist][file + dist] === c.B_QUEEN) {
                return true;
            }
        }
        for (let dist = 1; file + dist <= c.FILE_H && rank + dist <= c.RANK_8; dist++) { // from north-east
            if (support.isPieceWhite(this.board[rank + dist][file + dist])) {
                break;
            }
            if (this.board[rank + dist][file + dist] === c.B_BISHOP || this.board[rank + dist][file + dist] === c.B_QUEEN) {
                return true;
            }
        }

        // Attacked by rook or queen directly.
        for (let dist = 1; rank + dist <= c.RANK_8; dist++) { // from north
            if (support.isPieceWhite(this.board[rank + dist][file])) {
                break;
            }
            if (this.board[rank + dist][file] === c.B_ROOK || this.board[rank + dist][file] === c.B_QUEEN) {
                return true;
            }
        }
        for (let dist = 1; file - dist >= c.FILE_A; dist++) { // from west
            if (support.isPieceWhite(this.board[rank][file - dist])) {
                break;
            }
            if (this.board[rank][file - dist] === c.B_ROOK || this.board[rank][file - dist] === c.B_QUEEN) {
                return true;
            }
        }
        for (let dist = 1; rank - dist >= c.RANK_1; dist++) { // from south
            if (support.isPieceWhite(this.board[rank - dist][file])) {
                break;
            }
            if (this.board[rank - dist][file] === c.B_ROOK || this.board[rank - dist][file] === c.B_QUEEN) {
                return true;
            }
        }
        for (let dist = 1; file + dist <= c.FILE_H; dist++) { // from east
            if (support.isPieceWhite(this.board[rank][file + dist])) {
                break;
            }
            if (this.board[rank][file + dist] === c.B_ROOK || this.board[rank][file + dist] === c.B_QUEEN) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check if black king is attacked in current position.
     *
     * @returns {boolean} is black king under attack
     */
    isBlackKingAttacked() {
        const file = this.kingsPosition.black.file;
        const rank = this.kingsPosition.black.rank;

        // Attacked by pawn?
        if (rank >= c.RANK_3 && ((file >= c.FILE_B && this.board[file - 1][rank - 1] === c.W_PAWN) || (file <= c.FILE_G && this.board[file + 1][rank - 1] === c.W_PAWN))) {
            return true;
        }

        // Attacked by knight?
        if ((rank <= c.RANK_6 && ((file >= c.FILE_B && this.board[rank + 2][file - 1] === c.W_KNIGHT) || (file <= c.FILE_G && this.board[rank + 2][file + 1] === c.W_KNIGHT))) ||
            (rank >= c.RANK_3 && ((file >= c.FILE_B && this.board[rank - 2][file - 1] === c.W_KNIGHT) || (file <= c.FILE_G && this.board[rank - 2][file + 1] === c.W_KNIGHT))) ||
            (file >= c.FILE_C && ((rank >= c.RANK_2 && this.board[rank - 1][file - 2] === c.W_KNIGHT) || (rank <= c.RANK_7 && this.board[rank + 1][file - 2] === c.W_KNIGHT))) ||
            (file <= c.FILE_F && ((rank <= c.RANK_7 && this.board[rank + 1][file - 2] === c.W_KNIGHT) || (rank <= c.RANK_7 && this.board[rank + 1][file + 2] === c.W_KNIGHT)))) {
            return true;
        }

        // Attacked by bishop or queen diagonally?
        for (let dist = 1; file - dist >= c.FILE_A && rank + dist <= c.RANK_8; dist++) { // from north-west
            if (support.isPieceBlack(this.board[rank + dist][file - dist])) {
                break;
            }
            if (this.board[rank + dist][file - dist] === c.W_BISHOP || this.board[rank + dist][file - dist] === c.W_QUEEN) {
                return true;
            }
        }
        for (let dist = 1; file - dist >= c.FILE_A && rank - dist >= c.RANK_1; dist++) { // from south-west
            if (support.isPieceBlack(this.board[rank - dist][file - dist])) {
                break;
            }
            if (this.board[rank - dist][file - dist] === c.W_BISHOP || this.board[rank - dist][file - dist] === c.W_QUEEN) {
                return true;
            }
        }
        for (let dist = 1; file + dist <= c.FILE_H && rank - dist >= c.RANK_1; dist++) { // from south-east
            if (support.isPieceBlack(this.board[rank - dist][file + dist])) {
                break;
            }
            if (this.board[rank - dist][file + dist] === c.W_BISHOP || this.board[rank - dist][file + dist] === c.W_QUEEN) {
                return true;
            }
        }
        for (let dist = 1; file + dist <= c.FILE_H && rank + dist <= c.RANK_8; dist++) { // from north-east
            if (support.isPieceBlack(this.board[rank + dist][file + dist])) {
                break;
            }
            if (this.board[rank + dist][file + dist] === c.W_BISHOP || this.board[rank + dist][file + dist] === c.W_QUEEN) {
                return true;
            }
        }

        // Attacked by rook or queen directly.
        for (let dist = 1; rank + dist <= c.RANK_8; dist++) { // from north
            if (support.isPieceBlack(this.board[rank + dist][file])) {
                break;
            }
            if (this.board[rank + dist][file] === c.W_ROOK || this.board[rank + dist][file] === c.W_QUEEN) {
                return true;
            }
        }
        for (let dist = 1; file - dist >= c.FILE_A; dist++) { // from west
            if (support.isPieceBlack(this.board[rank][file - dist])) {
                break;
            }
            if (this.board[rank][file - dist] === c.W_ROOK || this.board[rank][file - dist] === c.W_QUEEN) {
                return true;
            }
        }
        for (let dist = 1; rank - dist >= c.RANK_1; dist++) { // from south
            if (support.isPieceBlack(this.board[rank - dist][file])) {
                break;
            }
            if (this.board[rank - dist][file] === c.W_ROOK || this.board[rank - dist][file] === c.W_QUEEN) {
                return true;
            }
        }
        for (let dist = 1; file + dist <= c.FILE_H; dist++) { // from east
            if (support.isPieceBlack(this.board[rank][file + dist])) {
                break;
            }
            if (this.board[rank][file + dist] === c.W_ROOK || this.board[rank][file + dist] === c.W_QUEEN) {
                return true;
            }
        }

        return false;
    }
}

module.exports = Game;

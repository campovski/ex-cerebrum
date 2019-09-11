const c = require('./constants');

/**
 * For given Lichess API file notation, convert it to array index.
 *
 * @param {string} file - character from 'a' to 'h'
 * @returns {number} file as array index
 */
function parseIndexFile(file) {
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
            throw new Error('[game.parseIndexFile] Unknown file.');
    }
}

/**
 * Converts Lichess API rank notation (1-8) to 0-based integer.
 *
 * @param {string} rank - character from '1' to '8'
 * @returns {number} rank as array index
 */
function parseIndexRank(rank) {
    return parseInt(rank) - 1;
}

/**
 * Convert index of file into frontend representation (same as Lichess API).
 *
 * @param {number} file - index of file
 * @returns {string} representation of file as in element id in frontend
 */
function parseLetterFile(file) {
    return c.FRONTEND_FILES[file];
}

/**
 * Convert index of rank into frontend representation.
 *
 * @param {number} rank - index of rank
 * @returns {string} representation of rank as in element id in frontend
 */
function parseLetterRank(rank) {
    return (rank + 1).toString();
}

/**
 * Convert a 4D vector representation of move to UCI format.
 *
 * @param {Array<number>} move - move as 4D vector
 * @returns {string} - move in UCI format
 */
function moveToUci(move) {
    return parseLetterFile(move[0]) +
        parseLetterRank(move[1]) +
        parseLetterFile(move[2]) +
        parseLetterRank(move[3]);
}

/**
 * Check if piece is white.
 *
 * @param {string} piece - piece representation
 * @returns {boolean} is piece white?
 */
function isPieceWhite(piece) {
    return [c.W_PAWN, c.W_KNIGHT, c.W_BISHOP, c.W_ROOK, c.W_QUEEN, c.W_KING].includes(piece);
}

/**
 * Check if piece is black.
 *
 * @param {string} piece - piece representation
 * @returns {boolean} is piece black?
 */
function isPieceBlack(piece) {
    return [c.B_PAWN, c.B_KNIGHT, c.B_BISHOP, c.B_ROOK, c.B_QUEEN, c.B_KING].includes(piece);
}

/**
 * Check if piece is not white. This is faster than
 * !isPieceWhite(piece) in most cases because there
 * are many empty fields.
 *
 * @param {string} piece - piece representation
 * @returns {boolean} is piece empty or black?
 */
function isPieceNotWhite(piece) {
    return piece === c.EMPTY || isPieceBlack(piece);
}

/**
 * Check if piece is not black. This is faster than
 * !isPieceBlack(piece) in most cases because there
 * are many empty fields.
 *
 * @param {string} piece - piece representation
 * @returns {boolean} is piece empty or white?
 */
function isPieceNotBlack(piece) {
    return piece === c.EMPTY || isPieceWhite(piece);
}

module.exports = {
    parseIndexFile: parseIndexFile,
    parseIndexRank: parseIndexRank,
    parseLetterFile: parseLetterFile,
    parseLetterRank: parseLetterRank,
    moveToUci: moveToUci,
    isPieceWhite: isPieceWhite,
    isPieceBlack: isPieceBlack,
    isPieceNotWhite: isPieceNotWhite,
    isPieceNotBlack: isPieceNotBlack
};

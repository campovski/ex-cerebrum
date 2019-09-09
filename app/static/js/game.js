const c = require('../../modules/constants');
const socketio = require('socket.io-client');

/** {object|null} information about previous move */
let prevMove = null;

// Register socket event listeners.
const socket = socketio.connect();
socket.on(c.EVENT_SOCKET_GAME_START, handleGameStart);
socket.on(c.EVENT_SOCKET_GAME_END, handleGameEnd);
socket.on(c.EVENT_SOCKET_UPDATE_BOARD, handleUpdate);

/**
 * Handle game start. Initialize chessboard.
 * TODO Bar with moves.
 *
 * @param {object} data - Game.board object
 * @returns {void}
 */
function handleGameStart(data) {
    console.log('begin', data);
    initializeBoard(data.board);
}

/**
 * Handle game end. Leave chessboard as is.
 * TODO Notify who won the game
 *
 * @param {object} data - object with full game data
 * @returns {void}
 */
function handleGameEnd(data) {
    console.log('end', data);
}

/**
 * Handle update board. Update chessboard with data.move.
 * TODO Update moves bar, use another field in data.
 *
 * @param {object} data - data with update details
 * @returns {void}
 */
function handleUpdate(data) {
    console.log('update', data);
    updateBoard(data.move);
}

/**
 * Insert images into the HTML chessboard squares based on position
 * given as parameter.
 *
 * @param {Array<Array<string>>} board - Game.board
 * @returns {void}
 */
function initializeBoard(board) {
    for (let rank = c.RANK_1; rank <= c.RANK_8; rank++) {
        for (let file = c.FILE_A; file <= c.FILE_H; file++) {
            const field = document.getElementById(getBoardFieldId(file, rank));
            switch (board[rank][file]) {
                case c.EMPTY:
                    break;
                case c.W_PAWN:
                    field.innerHTML = `<img src="${c.IMG_W_PAWN}"></img>`;
                    break;
                case c.B_PAWN:
                    field.innerHTML = `<img src="${c.IMG_B_PAWN}"></img>`;
                    break;
                case c.W_KNIGHT:
                    field.innerHTML = `<img src="${c.IMG_W_KNIGHT}"></img>`;
                    break;
                case c.B_KNIGHT:
                    field.innerHTML = `<img src="${c.IMG_B_KNIGHT}"></img>`;
                    break;
                case c.W_BISHOP:
                    field.innerHTML = `<img src="${c.IMG_W_BISHOP}"></img>`;
                    break;
                case c.B_BISHOP:
                    field.innerHTML = `<img src="${c.IMG_B_BISHOP}"></img>`;
                    break;
                case c.W_ROOK:
                    field.innerHTML = `<img src="${c.IMG_W_ROOK}"></img>`;
                    break;
                case c.B_ROOK:
                    field.innerHTML = `<img src="${c.IMG_B_ROOK}"></img>`;
                    break;
                case c.W_QUEEN:
                    field.innerHTML = `<img src="${c.IMG_W_QUEEN}"></img>`;
                    break;
                case c.B_QUEEN:
                    field.innerHTML = `<img src="${c.IMG_B_QUEEN}"></img>`;
                    break;
                case c.W_KING:
                    field.innerHTML = `<img src="${c.IMG_W_KING}"></img>`;
                    break;
                case c.B_KING:
                    field.innerHTML = `<img src="${c.IMG_B_KING}"></img>`;
                    break;
            }
        }
    }

    document.getElementById('noGameNotification').classList.add('invisible');
    document.getElementById('chessboard').classList.remove('invisible');
}

/**
 * Given a move update chessboard. Remove the highlights on previous move
 * and highlight current move.
 *
 * @param {object} move - contains information about previous move
 * @returns {void}
 */
function updateBoard(move) {
    const fieldFrom = document.getElementById(move.from);
    const fieldTo = document.getElementById(move.to);

    // Take care of move highlighting.
    if (prevMove !== null) {
        document.getElementById(prevMove.from).classList.remove('highlight');
        document.getElementById(prevMove.to).classList.remove('highlight');
    }
    fieldFrom.classList.add('highlight');
    fieldTo.classList.add('highlight');

    // Update pieces on board.
    fieldTo.innerHTML = fieldFrom.innerHTML;
    fieldFrom.innerHTML = '';

    // Save current move as previous for the next call.
    prevMove = move;
}

/**
 * Create id of HTML element that represents chessboard field.
 *
 * @param {number} file - numerical index of file
 * @param {number} rank - numerical index of rank
 * @returns {string} id of the HTML field
 */
function getBoardFieldId(file, rank) {
    return c.FRONTEND_FILES[file] + (rank + 1);
}

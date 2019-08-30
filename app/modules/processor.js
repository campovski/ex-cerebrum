const exCerebrum = require('./exCerebrum');
const lichess = require('./lichess');
const c = require('./constants');

// When lichess module emits EVENT_STREAM_GAME_STATE_DATA, use game state processor and check what happened.
lichess.emitter.on(c.EVENT_STREAM_GAME_STATE_DATA, processGameState);

// When lichess module emits EVENT_STREAM_GAME_STATE_END, use
lichess.emitter.on(c.EVENT_STREAM_GAME_STATE_END, processStreamEventEnd);

/**
 * When game stream gets updated, this function is called to process the event.
 *
 * @param {object} data - object containing move or chat information
 * @returns {void}
 */
function processGameState(data) {
    console.log('processGameState');
    switch (data['type']) {
        case 'gameState':
            const moves = data['moves'].split(' ');
            processMove(moves[moves.length - 1]);
            break;
        case 'chatLine':
            console.log(`[${data['room']}] User ${data['username']} said ${data['text']}`);
            // TODO process chat line. This can also be used to notify frontend about draw offer.
            break;
        default:
            console.log(typeof data);
            console.log(data);
    }
}

function processMove(move) {
    if (typeof move !== 'string' && move.length !== 4) {
        throw new Error('[processor.processMove] Bad argument!');
    }
    // process move
}

/**
 * When game stream ends, there is no information whether the
 * game has ended or something else went wrong. Therefore,
 * we need to query Lichess API to see if the game has ended or not.
 *
 * @returns {void}
 */
function processStreamEventEnd() {
    console.log('stream ended');
}

module.exports = {
    processGameState: processGameState
};

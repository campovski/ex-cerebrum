const exCerebrum = require('./exCerebrum');
const lichess = require('./lichess');
const c = require('./constants');

// When lichess module emits EVENT_STREAM_GAME_STATE_DATA, use game state processor and check what happened.
lichess.emitter.on(c.EVENT_STREAM_GAME_STATE_DATA, processGameState);

// When lichess module emits EVENT_STREAM_GAME_STATE_END, check whether the game is finished.
lichess.emitter.on(c.EVENT_STREAM_GAME_STATE_END, processGameStreamEventEnd);

// When incoming event is received via lichess.readStreamIncomingEvents(), process it.
lichess.emitter.on(c.EVENT_STREAM_INCOMING_EVENTS_DATA, processIncomingEvents);

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

/**
 * Process data received in incoming events stream from lichess module.
 * There are two types of data, 'gameStart' and 'challenge'. If type is
 * 'gameStart', then we setup chess bot.
 *
 * @param {object} data - object containing all information about the game
 * @returns {void}
 */
function processIncomingEvents(data) {
    console.log('Processing incoming events ...');
    try {
        if (data['type'] === 'gameStart') {
            processGameStart(data);
        } else {
            const challengeId = data.match(/{"type":"challenge","challenge":{"id":"(.*?)","status":"created"/)[1];
            console.log(`Challenge ${challengeId}`);
            if (isChallengeAcceptable(JSON.parse(data))) {
                lichess.support.acceptChallenge(challengeId)
                    .then(() => console.log(`[processor.processIncomingEvents] Challenge ${challengeId} accepted!`))
                    .catch(reason => console.log(reason));
            }
        }
    } catch (error) {
        console.log(error);
    }
}

/**
 * Logic that determines whether this challenge satisfies some
 * predefined rules, defined in this function.
 *
 * @param {object} challenge - data about challenge
 * @returns {boolean} info if challenge is acceptable or not
 */
function isChallengeAcceptable(challenge) {
    // TODO some logic instead of pure true
    return true;
}

function processGameStart(data) {
    const gameId = data.match(/{"type":"gameStart","game":{"id":"(.*?)"}}/)[1];
    console.log(`Game ${gameId} started`);
    // TODO somehow initialize the chess computer
}

function processGameEnd(data) {
    console.log('Game is finished');
    // TODO implement destruction of chess bot and then search for new game, probably by emitting event
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
 * @param {string} gameId - ID of the game the stream has ended
 * @returns {void}
 */
async function processGameStreamEventEnd(gameId) {
    console.log('stream ended');
    const response = await lichess.support.exportOneGameAsJson(gameId, false, false);
    if (response['status'] === 200) { // the game is finished
        processGameEnd(response['data']);
    } else {
        throw new Error('[processor.processGameStreamEventEnd] Stream quit unexpectedly.');
        // TODO reconnect to stream instead of throwing error
    }
}

module.exports = {
    processGameState: processGameState
};

const c = require('./constants');
const ExCerebrum = require('./exCerebrum');
const lichess = require('./lichess');

/** {string} ID of the game currently playing */
let gameId = null;

/** {ExCerebrum} bot */
let bot = null;

// When lichess module emits EVENT_STREAM_GAME_STATE_DATA, use game state processor and check what happened.
lichess.emitter.on(c.EVENT_STREAM_GAME_STATE_DATA, processGameState);

// When lichess module emits EVENT_STREAM_GAME_STATE_END, check whether the game is finished.
// lichess.emitter.on(c.EVENT_STREAM_GAME_STATE_END, processGameStreamEventEnd);

// When incoming event is received via lichess.readStreamIncomingEvents(), process it.
lichess.emitter.on(c.EVENT_STREAM_INCOMING_EVENTS_DATA, processIncomingEvents);

// Open stream for incoming events. Since that stream never resolves, we don't need .then.
lichess.api.readStreamIncomingEvents()
    .catch(reason => console.log(reason));

/**
 * When game stream gets updated, this function is called to process the event.
 *
 * @param {object} data - object containing move or chat information
 * @returns {void}
 */
function processGameState(data) {
    console.log(data);
    console.log('processGameState');
    switch (data['type']) {
        case 'gameState':
            const moves = data['moves'].split(' ');
            processMove(moves[moves.length - 1]);
            console.log(bot.game.toString());
            break;
        case 'chatLine':
            console.log(`[${data['room']}] User ${data['username']} said ${data['text']}`);
            // TODO process chat line. This can also be used to notify frontend about draw offer.
            break;
        case 'gameFull':
            if (bot !== null) {
                return; // fallback scenario in case gameFull is received when bot is already initialized
            }
            bot = new ExCerebrum(data);
            console.log(bot.game.toString());
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
            const challengeId = data['challenge']['id'];
            console.log(`Challenge ${challengeId}`);
            if (isChallengeAcceptable(data)) {
                lichess.api.acceptChallenge(challengeId)
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

/**
 * When game starts, we save current game id and start
 * the game stream listener.
 *
 * @param {object} data - containing just the ID of the game and event gameStart
 * @returns {void}
 */
function processGameStart(data) {
    gameId = data['game']['id'];
    console.log(`Game ${gameId} started`);
    console.log(data);
    lichess.api.getStreamGameState(gameId)
        .then(() => processGameStreamEventEnd(gameId))
        .catch(reason => console.log(reason));
}

/**
 * Simple cleanup function that reinitializes variables to null after game ended.
 *
 * @param {object} fullGameData - all data about the game that finished
 * @returns {void}
 */
function processGameEnd(fullGameData) {
    console.log(`Game is finished with status ${fullGameData['status']}`);
    bot = null;
    gameId = null;
}

/**
 * When move is played, notify the bot to update its board and make a move.
 *
 * @param {string} move - move that was played by bot's opponent
 * @returns {void}
 */
function processMove(move) {
    if (typeof move !== 'string' && move.length !== 4) {
        throw new Error('[processor.processMove] Bad argument!');
    }
    console.log(move);
    const respondWithMove = bot.updateAndMakeMove(move);
    // TODO post to Lichess API
    // lichess.api.makeMove(gameId, respondWithMove)
    //     .then(() => console.log(`[${gameId}] move ${respondWithMove} played!`))
    //     .catch(reason => console.log(reason));
    console.log(respondWithMove);
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
    const response = await lichess.api.exportOneGameAsJson(gameId, false, false);
    if (response['status'] === 200) { // the game is finished
        processGameEnd(response['data']);
    } else {
        throw new Error('[processor.processGameStreamEventEnd] Stream quit unexpectedly.');
        // TODO reconnect to stream instead of throwing error
    }
}

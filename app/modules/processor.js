const c = require('./constants');
const EventEmitter = require('events');
const ExCerebrum = require('./exCerebrum');
const lichess = require('./lichess');

/** {string} ID of the game currently playing */
let gameId = null;

/** {ExCerebrum} bot */
let bot = null;

/**
 * Event emitter used for communication between this module and server
 * because we need to notify the server to update clients' frontend.
 *
 * @type {module:events.internal}
 */
const eventEmitter = new EventEmitter();

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
            break;
        case 'chatLine':
            console.log(`[${data['room']}] User ${data['username']} said ${data['text']}`);
            // TODO process chat line. This can also be used to notify frontend about draw offer.
            break;
        case 'gameFull':
            if (bot !== null) {
                return; // fallback scenario in case gameFull is received when bot is already initialized
            }
            processGameStart(data);
    }
}

/**
 * Process data received in incoming events stream from lichess module.
 * There are two types of data, 'gameStart' and 'challenge'. If type is
 * 'gameStart', then we open the game stream for that game, else it is
 * challenge, we decide whether to accept it or not.
 *
 * @param {object} data - object containing all information about the game
 * @returns {void}
 */
function processIncomingEvents(data) {
    console.log('Processing incoming events ...');
    try {
        if (data['type'] === 'gameStart') {
            lichess.api.getStreamGameState(data['game']['id'])
                .then(() => processGameStreamEventEnd(data['game']['id']))
                .catch(reason => console.log(reason));
        } else {
            const challengeId = data['challenge']['id'];
            console.log(`Challenge ${challengeId}`);
            if (isChallengeAcceptable(data['challenge'])) {
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
    return challenge['variant']['key'] === 'standard';
}

/**
 * When game starts, we save current game id, initialize the bot
 * and emit the start-of-game event.
 *
 * @param {object} data - containing just the ID of the game and event gameStart
 * @returns {void}
 */
function processGameStart(data) {
    gameId = data['id'];
    bot = new ExCerebrum(data);
    eventEmitter.emit(c.EVENT_PROCESSOR_GAME_START, bot.game);
    console.log(`Game ${gameId} started`);
    console.log(bot.game.toString());
}

/**
 * Simple cleanup function that reinitializes variables to null after game ended
 * and emits the end-of-game event.
 *
 * @param {object} fullGameData - all data about the game that finished
 * @returns {void}
 */
function processGameEnd(fullGameData) {
    console.log(`Game is finished with status ${fullGameData['status']}`);
    eventEmitter.emit(c.EVENT_PROCESSOR_GAME_END, fullGameData);
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
    console.log(move);
    if (typeof move !== 'string' && move.length !== 4) {
        throw new Error('[processor.processMove] Bad argument!');
    }

    eventEmitter.emit(c.EVENT_PROCESSOR_UPDATE_BOARD, {
        move: {
            from: move.substr(0, 2),
            to: move.substr(2, 2)
        }
    });

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

// We only expose eventEmitter and only to server!
module.exports = eventEmitter;

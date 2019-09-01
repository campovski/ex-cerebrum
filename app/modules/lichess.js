const axios = require('axios');
const https = require('https');
const EventEmitter = require('events');
const c = require('./constants');

/**
 * Used for emitting events from stream readers.
 * To be used in processor module for processing
 * stream event 'on'.
 *
 * @type {module:events.internal}
 */
const eventEmitter = new EventEmitter();

/**
 * Get user data from Lichess.
 *
 * @returns {Promise<AxiosResponse<object>>} Promise to give user data
 */
function getProfileData() {
    return axios.get(
        '/api/account',
        {
            baseURL: 'https://lichess.org/',
            headers: { Authorization: `Bearer ${process.env.LICHESS_TOKEN}` }
        }
    );
}

/**
 * Reads the incoming event stream. On nonempty data, resolve
 * the data read as string. On event 'end', reject the promise
 * with Error.
 *
 * @returns {Promise<AxiosResponse<string>>} incoming event object as string
 */
function readStreamIncomingEvents() {
    console.log('Reading stream ...');

    const options = {
        hostname: 'lichess.org',
        path: '/api/stream/event',
        headers: { Authorization: `Bearer ${process.env.LICHESS_TOKEN}` }
    };

    return new Promise((resolve, reject) => {
        https.get(options, (res) => {
            res.on('data', (chunk) => {
                const data = chunk.toString();
                if (data.length > 1 && data.includes('{')) {
                    eventEmitter.emit(c.EVENT_STREAM_INCOMING_EVENTS_DATA, JSON.parse(data));
                }
            });
            res.on('end', () => {
                reject(new Error('[lichess.readStreamIncomingEvents] Stream ended.'));
            });
        });
    });
}

/**
 * Create challenge with given specifications. For live games provide
 * clockLimit and clockIncrement, for correspondence set clockLimit and
 * clockIncrement to -1 and provide days.
 *
 * @param {string} username - challenge user with this username
 * @param {boolean} rated - is this game rated?
 * @param {number} clockLimit - initial limit in seconds
 * @param {number} clockIncrement - increment in seconds
 * @param {number} days - for correspondence games only
 * @param {string} color - either 'black', 'white' or 'random'
 * @param {string} variant - variant name
 * @returns {Promise<AxiosResponse<object>>|void} null if wrong input args, otherwise Promise
 */
function createChallenge(username, rated, clockLimit, clockIncrement, days, color = 'random', variant = 'standard') {
    if ((clockLimit || clockIncrement) && days) {
        console.log('Cannot supply clock and days together');
        return;
    }

    let requestBody = null;
    if (clockLimit !== -1 && clockIncrement !== -1) {
        console.log(`Challenging ${username} with time control ${clockLimit}+${clockIncrement}`);
        requestBody = `rated=${rated}&clock.limit=${clockLimit}&clock.increment=${clockIncrement}&color=${color}&variant=${variant}`;
    } else {
        console.log(`Challenging ${username} to correspondence ${days} days`);
        requestBody = `rated=${rated}&days=${days}&color=${color}&variant=${variant}`;
    }

    console.log(`\tcolor: ${color}, variant: ${variant}`);

    return axios.post(
        `/api/challenge/${username}`,
        requestBody,
        {
            baseURL: 'https://lichess.org/',
            headers: {
                Authorization: `Bearer ${process.env.LICHESS_TOKEN}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }
    );
}

/**
 * Accept the challenge with id challengeId.
 *
 * @param {string} challengeId - ID of the challenge to be accepted
 * @returns {Promise<AxiosResponse<object>>} Promise
 */
function acceptChallenge(challengeId) {
    console.log(`Accepting challenge ${challengeId} ...`);
    return axios.post(
        `/api/challenge/${challengeId}/accept`,
        {},
        {
            baseURL: 'https://lichess.org',
            headers: { Authorization: `Bearer ${process.env.LICHESS_TOKEN}` }
        }
    );
}

/**
 * Decline the challenge with id challengeId.
 *
 * @param {string} challengeId - ID of the challenge to be declined
 * @returns {Promise<AxiosResponse<object>>} Promise
 */
function declineChallenge(challengeId) {
    console.log(`Declining challenge ${challengeId} ...`);
    return axios.post(
        `/api/challenge/${challengeId}/decline`,
        {},
        {
            baseURL: 'https://lichess.org',
            headers: { Authorization: `Bearer ${process.env.LICHESS_TOKEN}` }
        }
    );
}

/**
 * Listens on game state stream for game events like moves, chat, etc.
 *
 * @param {string} gameId - ID of the game to be streamed
 * @returns {Promise<string>} notification on event 'end'
 */
function getStreamGameState(gameId) {
    console.log(`Reading stream of game ${gameId} ...`);

    const options = {
        hostname: 'lichess.org',
        path: `/api/bot/game/stream/${gameId}`,
        headers: {
            Authorization: `Bearer ${process.env.LICHESS_TOKEN}`,
            Accept: 'application/json'
        }
    };

    return new Promise((resolve, reject) => {
        https.get(options, (res) => {
            res.on('data', (chunk) => {
                const data = chunk.toString();
                if (data.length > 1) {
                    try { // only one event in stream
                        eventEmitter.emit(c.EVENT_STREAM_GAME_STATE_DATA, JSON.parse(data));
                    } catch (e) { // multiple events in stream -> emit each one, except the last empty ''
                        data.split('\n')
                            .forEach((value, index, array) => {
                                if (index < array.length - 1) {
                                    eventEmitter.emit(c.EVENT_STREAM_GAME_STATE_DATA, JSON.parse(value));
                                }
                            });
                    }
                }
            });
            res.on('end', () => {
                console.log(`Stream of game ${gameId} ended.`);
                // eventEmitter.emit(c.EVENT_STREAM_GAME_STATE_END, gameId);
                resolve(`Game ${gameId} ended.`);
            });
        });
    });
}

/**
 * Make move move in game with ID gameId.
 *
 * @param {string} gameId - ID of the game in which to make move
 * @param {string} move - 4 letter move in UCI format
 * @returns {Promise<AxiosResponse<object>>} Promise
 */
function makeMove(gameId, move) {
    return axios.post(
        `/api/bot/game/${gameId}/move/${move}`,
        {},
        {
            baseURL: 'https://lichess.org',
            headers: { Authorization: `Bearer ${process.env.LICHESS_TOKEN}` }
        }
    );
}

/**
 * Write in chat of game with ID gameId with given room specifier.
 *
 * @param {string} gameId - ID of the game
 * @param {string} room - either 'spectator' or 'player'
 * @param {string} text - write this in the chat
 * @returns {Promise<AxiosResponse<object>>} Promise
 */
function writeInChat(gameId, room, text) {
    return axios.post(
        `/api/bot/game/${gameId}/chat`,
        `room=${room}&text=${text}`,
        {
            baseURL: 'https://lichess.org',
            headers: { Authorization: `Bearer ${process.env.LICHESS_TOKEN}` }
        }
    );
}

/**
 * Abort the game.
 *
 * @param {string} gameId - ID of the game to be aborted
 * @returns {Promise<AxiosResponse<object>>} Promise
 */
function abortGame(gameId) {
    return axios.post(
        `/api/bot/game/${gameId}/abort`,
        {},
        {
            baseURL: 'https://lichess.org',
            headers: { Authorization: `Bearer ${process.env.LICHESS_TOKEN}` }
        }
    );
}

/**
 * Resign the game.
 *
 * @param {string} gameId - ID of the game to be resigned
 * @returns {Promise<AxiosResponse<object>>} Promise
 */
function resignGame(gameId) {
    return axios.post(
        `/api/bot/game/${gameId}/resign`,
        {},
        {
            baseURL: 'https://lichess.org',
            headers: { Authorization: `Bearer ${process.env.LICHESS_TOKEN}` }
        }
    );
}

/**
 * Get game with gameId. This is useful to check if the game is finished
 * or not - check response object for key 'status'.
 *
 * @param {string} gameId - ID of the game
 * @param {boolean} moves - include PGN moves?
 * @param {boolean} tags - include PGN tags?
 * @param {boolean} clocks - include clock comments in PGN?
 * @param {boolean} evals - include analysis evaluation in PGN?
 * @param {boolean} opening - include opening information?
 * @param {boolean} literate - insert textual annotations in PGN?
 * @returns {Promise<AxiosResponse<object>>} Promise
 */
function exportOneGameAsJson(gameId, moves = true, tags = true, clocks = false, evals = false, opening = false, literate = false) {
    return axios.get(
        `/game/export/${gameId}?moves=${moves}&tags=${tags}&clocks=${clocks}&evals=${evals}&opening=${opening}&literate=${literate}`,
        {
            baseURL: 'https://lichess.org',
            headers: { Accept: 'application/json' }
        }
    );
}

module.exports = {
    emitter: eventEmitter,
    support: {
        getProfileData: getProfileData,
        readStreamIncomingEvents: readStreamIncomingEvents,
        createChallenge: createChallenge,
        acceptChallenge: acceptChallenge,
        declineChallenge: declineChallenge,
        getStreamGameState: getStreamGameState,
        makeMove: makeMove,
        writeInChat: writeInChat,
        abortGame: abortGame,
        resignGame: resignGame,
        exportOneGameAsJson: exportOneGameAsJson
    }
};

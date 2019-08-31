const c = require('./constants');
const ExCerebrum = require('./exCerebrum');
const lichess = require('./lichess');

class Processor {
    constructor() {
        /** {string} ID of the game currently playing */
        this.gameId = null;

        /** {ExCerebrum} bot */
        this.bot = null;

        // When lichess module emits EVENT_STREAM_GAME_STATE_DATA, use game state processor and check what happened.
        lichess.emitter.on(c.EVENT_STREAM_GAME_STATE_DATA, this.processGameState);

        // When lichess module emits EVENT_STREAM_GAME_STATE_END, check whether the game is finished.
        lichess.emitter.on(c.EVENT_STREAM_GAME_STATE_END, this.processGameStreamEventEnd);

        // When incoming event is received via lichess.readStreamIncomingEvents(), process it.
        lichess.emitter.on(c.EVENT_STREAM_INCOMING_EVENTS_DATA, this.processIncomingEvents);
    }

    /**
     * When game stream gets updated, this function is called to process the event.
     *
     * @param {object} data - object containing move or chat information
     * @returns {void}
     */
    processGameState(data) {
        console.log('processGameState');
        switch (data['type']) {
            case 'gameState':
                const moves = data['moves'].split(' ');
                this.processMove(moves[moves.length - 1]);
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
    processIncomingEvents(data) {
        console.log('Processing incoming events ...');
        try {
            if (data['type'] === 'gameStart') {
                Processor.processGameStart(data);
            } else {
                const challengeId = data['challenge']['id'];
                console.log(`Challenge ${challengeId}`);
                if (Processor.isChallengeAcceptable(data)) {
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
    static isChallengeAcceptable(challenge) {
        // TODO some logic instead of pure true
        return true;
    }

    processGameStart(data) {
        const gameId = data.match(/{"type":"gameStart","game":{"id":"(.*?)"}}/)[1];
        console.log(`Game ${gameId} started`);
        // TODO somehow initialize the chess computer
    }

    processGameEnd(data) {
        console.log('Game is finished');
        // TODO implement destruction of chess bot and then search for new game, probably by emitting event
    }

    processMove(move) {
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
    async processGameStreamEventEnd(gameId) {
        console.log('stream ended');
        const response = await lichess.support.exportOneGameAsJson(gameId, false, false);
        if (response['status'] === 200) { // the game is finished
            this.processGameEnd(response['data']);
        } else {
            throw new Error('[processor.processGameStreamEventEnd] Stream quit unexpectedly.');
            // TODO reconnect to stream instead of throwing error
        }
    }
}

module.exports = Processor;

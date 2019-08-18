const axios = require('axios');
const https = require('https');

function getProfileData() {
    return axios.get(
        '/api/account',
        {
            baseURL: 'https://lichess.org/',
            headers: { Authorization: `Bearer ${process.env.LICHESS_TOKEN}` }
        }
    );
}

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
                    res.socket.destroy();
                    resolve(data);
                }
            });
            res.on('end', () => {
                console.log(`Stream ended.`);
                reject(new Error('Stream ended.'));
            });
        });
    });
}

async function processIncomingEvents() {
    console.log('Processing incoming events ...');
    try {
        const data = await readStreamIncomingEvents();
        if (data.includes('"type":"gameStart"')) {
            const gameId = data.match(/{"type":"gameStart","game":{"id":"(.*?)"}}/)[1];
            console.log(`Game ${gameId} started`);
            return gameId;
        } else {
            const challengeId = data.match(/{"type":"challenge","challenge":{"id":"(.*?)","status":"created"/)[1];
            console.log(`Challenge ${challengeId}`);
            await acceptChallenge(challengeId);
            return await processIncomingEvents(); // call again because now we expect "gameStart" event
        }
    } catch (error) {
        console.log(error);
    }
}

function createChallenge(username, rated, clockLimit, clockIncrement, days, color, variant) {
    if ((clockLimit || clockIncrement) && days) {
        console.log('Cannot supply clock and days together');
        return null;
    }

    if (!color) color = 'random';
    if (!variant) variant = 'standard';

    let requestBody = null;
    if (clockLimit !== null && clockIncrement !== null) {
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
                    processGameStateEvent(data);
                }
            });
            res.on('end', () => {
                console.log(`Game ${gameId} ended.`);
                resolve(`Game ${gameId} ended.`);
            });
        });
    });
}

function processGameStateEvent(data) {
    console.log(data);
}

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

module.exports.support = {
    getProfileData: getProfileData,
    streamIncomingEvents: readStreamIncomingEvents,
    processIncomingEvents: processIncomingEvents,
    createChallenge: createChallenge,
    acceptChallenge: acceptChallenge,
    declineChallenge: declineChallenge,
    getStreamGameState: getStreamGameState,
    makeMove: makeMove,
    writeInChat: writeInChat,
    abortGame: abortGame,
    resignGame: resignGame
};

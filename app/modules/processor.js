const exCerebrum = require('./exCerebrum');

function processGameState(data) {
    console.log(data);
    switch (data['type']) {
        case 'gameState':
            const moves = data['moves'].split(' ');
            processMove(moves[moves.length - 1]);
            break;
        case 'chatLine':
            console.log(`[${data['room']}] User ${data['username']} said ${data['text']}`);
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

function processStreamEventEnd(gameId) {
    // go check if the game is finished
}

module.exports = {
    processGameState: processGameState
};

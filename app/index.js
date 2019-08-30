const express = require('express');
const lichess = require('./modules/lichess');
const processor = require('./modules/processor');

const app = express();

app.get('/test', async (req, res) => {
    try {
        // const result = await lichess.support.createChallenge('Makedonium', true, 60, 0, null, 'black', 'horde');
        // const result = await lichess.support.streamIncomingEvents();
        // console.log('[main] Game ' + await lichess.support.processIncomingEvents() + ' started');
        // const result = await lichess.support.acceptChallenge('w0Pr4CVB');
        await lichess.support.getStreamGameState('anPtjoKW');
        // const result = await lichess.support.makeMove('RpyH7mpF', 'e1e2');
        // const result = await lichess.support.resignGame('RpyH7mpF');
        // console.log(result);
        // return res.send(result);
    } catch (error) {
        console.log(error);
    }
});

const port = process.env.PORT || 1211;
app.listen(port, () => console.log(`Listening on port ${port}`));

const playersRouter = require('express').Router();
const Player = require('../models/playerModel');

playersRouter.get('/', async (_req, res) => {
    try {
        const players = await Player.find({});
        res.json(players.map(p => p.toJSON()));
    } catch (e) {
        console.log('error', e);
        res.status(409);
    }
});

playersRouter.post('/', async (req, res) => {
    const body = req.body;
    try {
        const newPlayer = new Player({
            name: body.name,
            color: '',
            host: body.host,
            lobbyReady: body.lobbyReady,
            startReady: body.startReady,
            stepControl: body.stepControl,
            flightControl: body.flightControl,
            coordX: body.coordX,
            coordY: body.coordY,
            turnOrder: body.turnOrder,
            canPlay: body.canPlay,
            hasMoved: body.hasMoved,
            stepsRemain: body.stepsRemain,
            hasFlown: body.hasFlown,
            flightTicket: body.flightTicket,
            boatTicket: body.boatTicket,
            freeBoatTicket: body.freeBoatTicket,
            money: body.money,
            hasWatchedTreasure: body.hasWatchedTreasure,
            hasGambled: body.hasGambled,
            hasStar: body.hasStar,
            hasShoe: body.hasShoe,
            firstInCapeTown: body.firstInCapeTown,
            firstInGoldCoast: body.firstInGoldCoast,
            winner: body.winner,
            uuid: body.uuid,
        });

        const players = await Player.find({});
        if (players.length === 0) {
            newPlayer.host = true;
        }

        const savedPlayer = await newPlayer.save();
        res.json(savedPlayer.toJSON());        
    } catch (e) {
        console.log('error', e);
        res.status(409);
    }
});

playersRouter.put('/:id', async (req, res) => {
    const body = req.body;
    try {
        const player = {
            name: body.name,
            color: body.color,
            host: body.host,
            lobbyReady: body.lobbyReady,
            startReady: body.startReady,
            stepControl: body.stepControl,
            flightControl: body.flightControl,
            coordX: body.coordX,
            coordY: body.coordY,
            turnOrder: body.turnOrder,
            canPlay: body.canPlay,
            hasMoved: body.hasMoved,
            stepsRemain: body.stepsRemain,
            hasFlown: body.hasFlown,
            flightTicket: body.flightTicket,
            boatTicket: body.boatTicket,
            freeBoatTicket: body.freeBoatTicket,
            money: body.money,
            hasWatchedTreasure: body.hasWatchedTreasure,
            hasGambled: body.hasGambled,
            hasStar: body.hasStar,
            firstInCapeTown: body.firstInCapeTown,
            firstInGoldCoast: body.firstInGoldCoast,
            winner: body.winner,
            hasShoe: body.hasShoe
        };
        const modifiedPlayer = await Player.findByIdAndUpdate(req.params.id, player, { new: true });
        res.json(modifiedPlayer.toJSON());
    } catch (e) {
        console.log('error', e);
        res.status(409);
    }
});

playersRouter.delete('/single/:id', async (req, res) => {
    try {
        await Player.findByIdAndRemove(req.params.id);
        res.status(204).end()
    } catch (e) {
        console.log('error', e);
        res.status(409);
    }
})

playersRouter.delete('/', async (_req, res) => {
    try {
        await Player.deleteMany({});
        res.status(204).end();
    } catch (e) {
        console.log('error', e);
        res.status(409);
    }
});

module.exports = playersRouter;
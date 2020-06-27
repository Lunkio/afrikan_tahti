const lobbiesRouter = require('express').Router();
const Lobby = require('../models/lobbyModel');

lobbiesRouter.get('/', async (_req, res) => {
    try {
        const lobbies = await Lobby.find({});
        res.json(lobbies.map(p => p.toJSON()));
    } catch (e) {
        console.log('error', e);
        res.status(409);
    }
});

lobbiesRouter.get('/:id', async (req, res) => {
    try {
        const lobby = await Lobby.findById(req.params.id);
        res.json(lobby.toJSON());
    } catch (e) {
        console.log('error', e);
        res.status(409);
    }
});

lobbiesRouter.post('/', async (req, res) => {
    const body = req.body;
    try {
        const newLobby = new Lobby({
            name: body.name,
            inGame: body.inGame,
            playersInLobby: body.playersInLobby,
            uuid: body.uuid
        });

        const savedLobby = await newLobby.save();
        res.json(savedLobby.toJSON());        
    } catch (e) {
        console.log('error', e);
        if (e.name === 'ValidationError') {
            return res.status(400).json({ error: e.message });
        }
        res.status(409);
    }
});

lobbiesRouter.put('/:id', async (req, res) => {
    const body = req.body;
    try {
        const lobby = {
            name: body.name,
            inGame: body.inGame,
            playersInLobby: body.playersInLobby,
            uuid: body.uuid
        };

        // poistaa Lobbyn jos siinä ei ole pelaajia
        if (lobby.playersInLobby.length === 0) {
            await Lobby.findByIdAndRemove(req.params.id);
            res.status(204).end();
            return;
        }

        const modifiedLobby = await Lobby.findByIdAndUpdate(req.params.id, lobby, { new: true });
        if (!modifiedLobby) {
            res.status(404).send({ error: 'lobby does not exist' });
            return;
        }
        res.json(modifiedLobby.toJSON());
    } catch (e) {
        console.log('error', e);
        res.status(409);
    }
});

lobbiesRouter.delete('/single/:id', async (req, res) => {
    try {
        await Lobby.findByIdAndRemove(req.params.id);
        res.status(204).end();
    } catch (e) {
        console.log('error', e);
        res.status(409);
    }
})

lobbiesRouter.delete('/', async (_req, res) => {
    try {
        await Lobby.deleteMany({});
        res.status(204).end();
    } catch (e) {
        console.log('error', e);
        res.status(409);
    }
});

module.exports = lobbiesRouter;
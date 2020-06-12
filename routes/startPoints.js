const { startPoints } = require('../data.json');
const startPointsRouter = require('express').Router();

startPointsRouter.get('/', async (_req, res) => {
    try {
        res.json(startPoints);
    } catch (e) {
        console.log('error', e);
    }
});

module.exports = startPointsRouter;
const { landingSpots } = require('../data.json');
const landingSpotsRouter = require('express').Router();

landingSpotsRouter.get('/', async (_req, res) => {
    try {
        res.json(landingSpots);
    } catch (e) {
        console.log('error', e);
    }
});

module.exports = landingSpotsRouter;
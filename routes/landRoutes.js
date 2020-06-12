const { landRoutes } = require('../data.json');
const landRoutesRouter = require('express').Router();

landRoutesRouter.get('/', async (_req, res) => {
    try {
        res.json(landRoutes);
    } catch (e) {
        console.log('error', e);
    }
});

module.exports = landRoutesRouter;
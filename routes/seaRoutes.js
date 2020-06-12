const { seaRoutes } = require('../data.json');
const seaRoutesRouter = require('express').Router();

seaRoutesRouter.get('/', async (_req, res) => {
    try {
        res.json(seaRoutes);
    } catch (e) {
        console.log('error', e);
    }
});

module.exports = seaRoutesRouter;
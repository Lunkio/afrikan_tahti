const landingTokensRouter = require('express').Router();
const LandingToken = require('../models/landingTokenModel');

landingTokensRouter.get('/', async (req, res) => {
    try {
        const tokens = await LandingToken.find({});
        res.json(tokens.map(t => t.toJSON()));
    } catch (e) {
        console.log('error', e);
        res.status(409);
    }
});

landingTokensRouter.post('/', async (req, res) => {
    const tokens = req.body;
    try {
        // Estää tokenien lisäämisen jos niitä jo DB:ssä
        const currentTokens = await LandingToken.find({});
        if (currentTokens.length > 0) {
            res.status(403).end();
            return;
        }

        for (let i = 0; i < tokens.length; i++) {
            const token = new LandingToken({
                type: tokens[i].type,
                moneyValue: tokens[i].moneyValue
            });
            const savedToken = await token.save();
        }
        const savedTokens = await LandingToken.find({});
        res.json(savedTokens.map(t => t.toJSON()));
    } catch (e) {
        console.log('error', e);
        res.status(409);
    }
});

landingTokensRouter.put('/:id', async (req, res) => {
    const body = req.body;
    try {
        const token = {
            type: body.type,
            moneyValue: body.moneyValue,
        };
        const modifiedToken = await LandingToken.findByIdAndUpdate(req.params.id, token, { new: true });
        res.json(modifiedToken.toJSON());
    } catch (e) {
        console.log('error', e);
        res.status(409);
    }
});

landingTokensRouter.delete('/', async (req, res) => {
    try {
        await LandingToken.deleteMany({});
        res.status(204).end();
    } catch (e) {
        console.log('error', e);
        res.status(409);
    }
});

module.exports = landingTokensRouter;
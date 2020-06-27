require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const landRoutesRouter = require('./routes/landRoutes');
const seaRoutesRouter = require('./routes/seaRoutes');
const landingSpotsRouter = require('./routes/landingSpots');
const startPointsRouter = require('./routes/startPoints');
const landingTokensRouter = require('./routes/landingTokens');
const lobbiesRouter = require('./routes/lobbies');

let MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })
    .then(() => { console.log('Connected to MongoDB') })
    .catch((e) => { console.log('Error', e.message) });

app.use(express.json());
app.use(cors());

app.use(express.static('build'));

app.use('/landRoutes', landRoutesRouter);
app.use('/seaRoutes', seaRoutesRouter);
app.use('/landingSpots', landingSpotsRouter);
app.use('/startPoints', startPointsRouter);
app.use('/landingTokens', landingTokensRouter);
app.use('/lobbies', lobbiesRouter);

module.exports = app;
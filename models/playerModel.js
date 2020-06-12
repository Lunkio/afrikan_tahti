const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    host: { type: Boolean },
    lobbyReady: { type: Boolean },
    startReady: { type: Boolean },
    color: { type: String },
    stepControl: { type: Number },
    flightControl: { type: Number },
    coordX: { type: Number },
    coordY: { type: Number },
    turnOrder: { type: Number },
    canPlay: { type: Boolean },
    hasMoved: { type: Boolean },
    stepsRemain: { type: Number },
    hasFlown: { type: Boolean },
    flightTicket: { type: Boolean },
    boatTicket: { type: Boolean },
    freeBoatTicket: { type: Boolean },
    money: { type: Number },
    hasWatchedTreasure: { type: Boolean },
    hasGambled: { type: Boolean },
    hasStar: { type: Boolean },
    hasShoe: { type: Boolean },
    firstInCapeTown: { type: Boolean },
    firstInGoldCoast: { type: Boolean },
    winner: { type: Boolean },
    uuid: { type: String, required: true },
});

playerSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
});

const Player = mongoose.model('Player', playerSchema);

module.exports = Player;
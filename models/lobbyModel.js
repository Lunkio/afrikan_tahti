const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const lobbySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    inGame: { type: Boolean, required: true },
    playersInLobby: { type: Array, required: true },
    uuid: { type: String, required: true }
});

lobbySchema.plugin(uniqueValidator);

lobbySchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
});

const Lobby = mongoose.model('Lobby', lobbySchema);

module.exports = Lobby;
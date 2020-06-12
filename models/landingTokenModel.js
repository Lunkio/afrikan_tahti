const mongoose = require('mongoose');

const landingTokenSchema = new mongoose.Schema({
    type: { type: String },
    moneyValue: { type: Number },
});

landingTokenSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
});

const LandingToken = mongoose.model('LandingToken', landingTokenSchema);

module.exports = LandingToken;
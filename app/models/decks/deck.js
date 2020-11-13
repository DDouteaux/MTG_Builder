const createDeck = require('./deck_create');
const getDecksOfUser = require('./deck_get').getDecksOfUserPlugin;
const getDeckById = require('./deck_get').getDeckByIdPlugin;
const getPublicDecks = require('./deck_get').getPublicDecksPlugin;
var mongoose = require('mongoose');

const deckSchema = mongoose.Schema({
        deckId: { type: String, unique: true },
        title : String,
        state : String,
        creationDate: { type: Date, default: Date.now },
        lastUpdateDate: { type: Date, default: Date.now },
        format: String,
        userId: String,
        source: String,
        description: String,
        derivedFrom: String,
        public: Boolean
})

deckSchema.plugin(createDeck);
deckSchema.plugin(getDecksOfUser);
deckSchema.plugin(getDeckById);
deckSchema.plugin(getPublicDecks);

var Deck = mongoose.model("Deck", deckSchema);

module.exports = Deck;
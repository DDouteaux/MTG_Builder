var mongoose = require('mongoose');

const CardForDeckSchema = mongoose.Schema({
        id: String,
        count: Number,
        status: String,
        deckPart: String
})

const deckSchema = mongoose.Schema({
        deckId: { type: String, unique: true },
        title : String,
        state : String,
        cards: [CardForDeckSchema],
        creationDate: { type: Date, default: Date.now },
        lastUpdateDate: { type: Date, default: Date.now },
        format: String,
        userId: String,
        source: String,
        sourceUrl: String,
        description: String
})

//deckSchema.plugin(getUserData);

var Deck = mongoose.model("Deck", deckSchema);

module.exports = Deck;
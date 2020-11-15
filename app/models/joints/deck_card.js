const getCardsFromDeck = require('./deck_card_get').getCardsFromDeckPlugin
const removeCardFromDeck = require('./deck_card_remove').removeCardFromDeckPlugin
const addCardToDeck = require('./deck_card_create').addCardToDeckPlugin
var mongoose = require('mongoose');

const CardForDeckSchema = mongoose.Schema({
        deckId: String,
        cardId: String,
        count: Number,
        deckPart: String
})

CardForDeckSchema.index({ deckId: 1, cardId: 1, deckPart: 1}, { unique: true });

CardForDeckSchema.plugin(addCardToDeck);
CardForDeckSchema.plugin(getCardsFromDeck);
CardForDeckSchema.plugin(removeCardFromDeck);

var CardForDeck = mongoose.model("CardForDeck", CardForDeckSchema);

module.exports = CardForDeck;
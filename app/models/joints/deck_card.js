const getCardsFromDeck = require('./deck_card_get').getCardsFromDeckPlugin
const removeCardFromDeck = require('./deck_card_remove').removeCardFromDeckPlugin
const removeAllCardsOfDeck = require('./deck_card_remove').removeAllCardsOfDeckPlugin
const modifyCardCountPlugin = require('./deck_card_update').modifyCardCountPlugin
const updateDeckCardPlugin = require('./deck_card_update').updateDeckCardPlugin
const addCardToDeck = require('./deck_card_create').addCardToDeckPlugin
var mongoose = require('mongoose');

const CardForDeckSchema = mongoose.Schema({
        deckId: String,
        cardId: String,
        count: Number,
        deckPart: String,
        comment: String,
        altCmc: Number,
        customPrice: Number
})

CardForDeckSchema.index({ deckId: 1, cardId: 1, deckPart: 1}, { unique: true });

CardForDeckSchema.plugin(addCardToDeck);
CardForDeckSchema.plugin(getCardsFromDeck);
CardForDeckSchema.plugin(removeCardFromDeck);
CardForDeckSchema.plugin(modifyCardCountPlugin);
CardForDeckSchema.plugin(removeAllCardsOfDeck);
CardForDeckSchema.plugin(updateDeckCardPlugin);

var CardForDeck = mongoose.model("CardForDeck", CardForDeckSchema);

module.exports = CardForDeck;
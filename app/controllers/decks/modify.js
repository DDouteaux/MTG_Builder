var logger = require.main.require('./app/loader/logger');
var DeckCard = require.main.require('./app/models/joints/deck_card');
var Deck = require.main.require('./app/models/decks/deck');
var DeckPartsEnum = require.main.require('./app/models/enums/deck_parts');

function addCardToDeck(deckId, cardIds, count, deckPart, comment, altCmc, userId, callback) {
    logger.debug("Méthode models/controllers/decks/modify/addCardToDeck");

    DeckCard.addCardToDeck(deckId, cardIds, count, deckPart, comment, altCmc, userId, callback)
}

function removeCardFromDeck(deckId, cardId, deckPart, userId, callback) {
    logger.debug("Méthode models/controllers/decks/modify/removeCardFromDeck");

    DeckCard.removeCardFromDeck(deckId, cardId, deckPart, userId, callback)
}

function modifyCardCount(deckId, cardId, deckPart, count, userId, callback) {
    logger.debug("Méthode models/controllers/decks/modify/modifyCardCount");

    DeckCard.modifyCardCount(deckId, cardId, deckPart, count, userId, callback);
}

function updateDeckCard(deckId, cardData, deckPart, userId, callback) {
    logger.debug("Méthode models/controllers/decks/modify/updateDeckCard");

    DeckCard.updateDeckCard(deckId, cardData, deckPart, userId, callback);
}

function deleteDeck(deckId, userId, callback) {
    logger.debug("Méthode models/controllers/decks/modify/deleteDeck");

    Deck.deleteDeck(deckId, userId, (err, data) => {
        if (typeof err === 'undefined' || err == null) {
            callback(err, data);
        } else {
            DeckCard.removeAllCardsOfDeck(deckId, callback)
        }
    });
}

function updateFields(deckId, field, value, userId, callback) {
    logger.debug("Méthode models/controllers/decks/modify/updateFields");

    Deck.updateField(deckId, field, value, userId, callback);
}

module.exports = { addCardToDeck: addCardToDeck,
                   removeCardFromDeck: removeCardFromDeck,
                   modifyCardCount: modifyCardCount,
                   deleteDeck: deleteDeck,
                   updateFields: updateFields,
                   updateDeckCard: updateDeckCard };
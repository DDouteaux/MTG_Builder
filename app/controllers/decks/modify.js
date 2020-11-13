var logger = require.main.require('./app/loader/logger');
var DeckCard = require.main.require('./app/models/joints/deck_card');
var DeckPartsEnum = require.main.require('./app/models/enums/deck_parts');

function addCardToDeck(deckId, cardId, count, deckPart, userId, callback) {
    logger.debug("Méthode models/controllers/decks/modify/addCardToDeck");

    err = []

    if (typeof cardId === "undefined" || cardId == null || cardId === "") {
        err.push("Pas de carte fournie");
    }
    if (typeof userId === "undefined" || userId == null || userId === "") {
        err.push("Pas d'utilisateur connecté");
    }
    if (typeof deckId === "undefined" || deckId == null || deckId === "") {
        err.push("Pas de deck fourni");
    }
    if (typeof deckPart === "undefined" || deckPart == null || deckPart === "") {
        deckPart = DeckPartsEnum.MAIN;
    }
    if (typeof count === "undefined" || count == null || count == 0) {
        count = 1;
    }

    if (err.length > 0) {
        callback(err);
    } else {
        DeckCard.addCardToDeck(deckId, cardId, count, deckPart, userId, callback)
    }
}

module.exports = { addCardToDeck: addCardToDeck };
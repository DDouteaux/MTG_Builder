var logger = require.main.require('./app/loader/logger');
var DeckCard = require.main.require('./app/models/joints/deck_card');
var Deck = require.main.require('./app/models/decks/deck');
var DeckPartsEnum = require.main.require('./app/models/enums/deck_parts');

function addCardToDeck(deckId, cardIds, count, deckPart, userId, callback) {
    logger.debug("Méthode models/controllers/decks/modify/addCardToDeck");

    err = []

    console.log(cardIds)
    if (typeof cardIds === "undefined" || cardIds == null) {
        err.push("Pas de carte fournie");
    } else {
        if (typeof cardIds === "string") {
            cardIds = [cardIds];
        }
        if (cardIds.length == 0) {
            err.push("Pas de carte fournie");
        }
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
        DeckCard.addCardToDeck(deckId, cardIds, count, deckPart, userId, callback)
    }
}

function removeCardFromDeck(deckId, cardId, deckPart, userId, callback) {
    logger.debug("Méthode models/controllers/decks/modify/removeCardFromDeck");

    err = []

    if (typeof cardId === "undefined" || cardId == null || cardId == "") {
        err.push("Pas de carte fournie.");
    }
    if (typeof userId === "undefined" || userId == null || userId === "") {
        err.push("Pas d'utilisateur connecté.");
    }
    if (typeof deckId === "undefined" || deckId == null || deckId === "") {
        err.push("Pas de deck fourni.");
    }
    if (typeof deckPart === "undefined" || deckPart == null || deckPart === "") {
        err.push("Pas de partie du deck fournie.");
    }

    if (err.length > 0) {
        callback(err);
    } else {
        DeckCard.removeCardFromDeck(deckId, cardId, deckPart, userId, callback)
    }
}

function modifyCardCount(deckId, cardId, deckPart, count, userId, callback) {
    logger.debug("Méthode models/controllers/decks/modify/modifyCardCount");

    err = []

    if (typeof cardId === "undefined" || cardId == null || cardId == "") {
        err.push("Pas de carte fournie.");
    }
    if (typeof userId === "undefined" || userId == null || userId === "") {
        err.push("Pas d'utilisateur connecté.");
    }
    if (typeof deckId === "undefined" || deckId == null || deckId === "") {
        err.push("Pas de deck fourni.");
    }
    if (typeof deckPart === "undefined" || deckPart == null || deckPart === "") {
        err.push("Pas de partie du deck fournie.");
    }
    if (typeof count === "undefined" || count == null || parseInt(count) === "NaN" || count < 0) {
        err.push("Le nombre d'exemplaires pour cette carte n'est pas valide.");
    }

    if (err.length > 0) {
        callback(err);
    } else {
        DeckCard.modifyCardCount(deckId, cardId, deckPart, count, userId, callback);
    }
}

function deleteDeck(deckId, userId, callback) {
    logger.debug("Méthode models/controllers/decks/modify/deleteDeck");

    err = []

    if (typeof userId === "undefined" || userId == null || userId === "") {
        err.push("Pas d'utilisateur connecté.");
    }
    if (typeof deckId === "undefined" || deckId == null || deckId === "") {
        err.push("Pas de deck fourni.");
    }

    if (err.length > 0) {
        callback(err);
    } else {
        Deck.deleteDeck(deckId, userId, (err, data) => {
            DeckCard.removeAllCardsOfDeck(deckId, callback)
        });
    }
}

module.exports = { addCardToDeck: addCardToDeck,
                   removeCardFromDeck: removeCardFromDeck,
                   modifyCardCount: modifyCardCount,
                   deleteDeck: deleteDeck };
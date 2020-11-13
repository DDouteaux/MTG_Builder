var logger = require.main.require('./app/loader/logger');
var Deck = require.main.require('./app/models/decks/deck');

function getDecksOfUser(userId, allowNoUser, callback) {
    logger.debug("Méthode models/controllers/decks/get/getDecksOfUser");

    if (typeof userId !== 'undefined' && userId != null) {
        Deck.getDecksOfUser(userId, callback)
    } else if (!allowNoUser) {
        callback("Aucun utilisateur connecté.");
    } else {
        callback(null, []);
    }
}

function getDeckById(deckId, callback) {
    logger.debug("Méthode models/controllers/decks/get/getDeckById");

    if (typeof deckId !== 'undefined' && deckId != null) {
        Deck.getDeckById(deckId, callback)
    } else {
        callback("Aucun deck trouvé.");
    }
}

function getPublicDecks(callback) {
    logger.debug("Méthode models/controllers/decks/get/getPublicDecks");

    Deck.getPublicDecks(callback);
}

module.exports = { getDecksOfUser: getDecksOfUser,
                   getDeckById: getDeckById,
                   getPublicDecks: getPublicDecks };

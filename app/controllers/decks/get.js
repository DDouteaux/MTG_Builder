var logger = require.main.require('./app/loader/logger');
var Deck = require.main.require('./app/models/decks/deck');

function getDecksOfUser(userId, callback) {
    logger.debug("Méthode models/controllers/decks/get/getDecksOfUser");

    if (typeof userId !== 'undefined' && userId != null) {
        Deck.getDecksOfUser(userId, callback)
    } else {
        callback("Aucun utilisateur connecté.");
    }
}

module.exports = { getDecksOfUser: getDecksOfUser };

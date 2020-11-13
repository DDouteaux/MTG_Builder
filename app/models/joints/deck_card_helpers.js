var logger = require.main.require('./app/loader/logger');
var Deck = require.main.require('./app/models/decks/deck');

async function checkIfDeckBelongsToUser(deckId, userId, callback) {
    results = await Deck.find({ deckId: deckId }, { __v: 0, _id: 0 }).exec().catch(err => {
        logger.error("models/decks/deck_cards_helpers/checkIfDeckBelongsToUser : Erreur de lecture sur la base");
        callback("Le deck n'a pas été trouvé");
        return;
    });

    if (results.length > 1) {
        logger.warn("models/decks/deck_cards_helpers/checkIfDeckBelongsToUser : Plus d'un deck possible pour l'id " + deckId);
        callback("Plusieurs decks possibles");
        return;
    } else if (results.length == 0) {
        logger.warn("models/decks/deck_cards_helpers/checkIfDeckBelongsToUser : Deck non trouvé " + deckId);
        callback("Deck non trouvé");
        return;
    }

    if (results[0].userId !== userId) {
        callback("Le deck n'appartient pas à cet utilisateur.");
        return;
    } else {
        callback(null, results[0]);
    }
}

module.exports = { checkIfDeckBelongsToUser: checkIfDeckBelongsToUser };
var logger = require.main.require('./app/loader/logger');
var helpers = require.main.require('./app/models/joints/deck_card_helpers');

function getCardsFromDeck(deckId, userId, callback) {
    logger.debug("Méthode models/decks/deck_cards_get/getCardsFromDeck");

    helpers.checkIfDeckBelongsToUser(deckId, userId, (err, deck) => {
        if (err != null) {
            callback(err);
            return;
        }

        this.find({
            deckId: deckId
        },
        {
            __v: 0,
            _id: 0
        },
        (err, docs) => {
            if(err) {
                logger.error("models/decks/deck_cards_get/getCardsFromDeck : Erreur de lecture sur la base");
                callback("Erreur de récupération des cartes", []);
                return;
            } else {
                callback(null, docs);
            }
        });
    })
}

function getCardsFromDeckPlugin(schema, options) {
    schema.statics.getCardsFromDeck = getCardsFromDeck;
}
  
module.exports = { getCardsFromDeckPlugin: getCardsFromDeckPlugin };
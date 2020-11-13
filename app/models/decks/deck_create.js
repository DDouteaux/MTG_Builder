var logger = require.main.require('./app/loader/logger');
var md5 = require('md5');

function createDeck(title, state, format, userId, source, description, cards, callback) {
    logger.debug("Méthode models/decks/deck_create/createDeck");

    deck = this({
        deckId: md5(title + userId + Date.now()),
        title: title,
        state: state,
        cards: cards,
        creationDate: Date.now(),
        lastUpdateDate: Date.now(),
        format: format,
        userId: userId,
        source: source,
        description: description,
        derivedFrom: "",
        public: false
    });
    
    deck.save(function(err, data) {
        if(err) {
            logger.error("models/decks/deck_create/createDeck : Erreur de lecture/écriture sur la base");
            console.log(err);
            err = "Erreur lors de la création du deck";
        }
        callback(err, data);
    });
}
  
function createDeckPlugin(schema, options) {
    schema.statics.createDeck = createDeck;
}
  
module.exports = createDeckPlugin;
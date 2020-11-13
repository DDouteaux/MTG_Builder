var logger = require.main.require('./app/loader/logger');

function getDecksOfUser(userId, callback) {
    logger.debug("Méthode models/decks/deck_get/getDecksOfUser");
    this.find(
        {
            userId: userId
        },
        {
            __v: 0,
            _id: 0
        }
    ).exec(function(err, results) {
        if(err) {
            logger.error("models/decks/deck_get/getDecksOfUser : Erreur de lecture sur la base");
            callback(err, []);
        } else {
            callback(err, JSON.parse(JSON.stringify(results)));
        }
    });
}

function getDeckById(deckId, callback) {
    logger.debug("Méthode models/decks/deck_get/getDeckById");
    this.find(
        {
            deckId: deckId
        },
        {
            __v: 0,
            _id: 0
        }
    ).exec(function(err, results) {
        if(err) {
            logger.error("models/decks/deck_get/getDeckById : Erreur de lecture sur la base");
            callback(err, []);
        } else {
            if (results.length > 1) {
                logger.warn("models/decks/deck_get/getDeckById : Plus d'un deck possible pour l'id " + deckId);
            }
            results = results[0]
            callback(err, JSON.parse(JSON.stringify(results)));
        }
    });
}

function getPublicDecks(callback) {
    logger.debug("Méthode models/decks/deck_get/getPublicDecks");
    this.find(
        {
            public: true
        },
        {
            __v: 0,
            _id: 0
        }
    ).exec(function(err, results) {
        if(err) {
            logger.error("models/decks/deck_get/getPublicDecks : Erreur de lecture sur la base");
            callback(err, []);
        } else {
            callback(err, JSON.parse(JSON.stringify(results)));
        }
    });
}

function getDecksOfUserPlugin(schema, options) {
    schema.statics.getDecksOfUser = getDecksOfUser;
}

function getDeckByIdPlugin(schema, options) {
    schema.statics.getDeckById = getDeckById;
}

function getPublicDecksPlugin(schema, options) {
    schema.statics.getPublicDecks = getPublicDecks;
}

module.exports = { getDecksOfUserPlugin: getDecksOfUserPlugin,
                   getDeckByIdPlugin: getDeckByIdPlugin,
                   getPublicDecksPlugin: getPublicDecksPlugin,
                   getDeckById: getDeckById };
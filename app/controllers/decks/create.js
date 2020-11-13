var logger = require.main.require('./app/loader/logger');
var Deck = require.main.require('./app/models/decks/deck');

function createDeck(title, state, format, userId, source, description, cards, callback) {
    logger.debug("Méthode models/controllers/decks/create/createDeck");

    err = []

    if (typeof title === "undefined" || title == null || title === "") {
        err.push("Pas de titre fourni");
    }
    if (typeof userId === "undefined" || userId == null || userId === "") {
        err.push("Pas d'utilisateur connecté");
    }
    if (typeof state === "undefined" || state == null) {
        state = StatesEnum.DRAFT;
    }
    if (typeof format === "undefined" || format == null) {
        format = FormatsEnum.DIVERSE;
    }
    if (typeof description === "undefined" || description == null) {
        description = "";
    }
    if (typeof cards === "undefined" || cards == null) {
        cards = [];
    }

    if (err.length > 0) {
        callback(err);
    } else {
        Deck.createDeck(title, state, format, userId, source, description, cards, callback)
    }
}

module.exports = { createDeck: createDeck };
var logger = require.main.require('./app/loader/logger');
var Deck = require.main.require('./app/models/decks/deck');
var DeckPartsEnum = require.main.require('./app/models/enums/deck_parts');

async function removeCardFromDeck(deckId, cardId, deckPart, userId, callback) {
    logger.debug("Méthode models/joints/deck_card_remove/removeCardFromDeck");

    results = await Deck.find({ deckId: deckId }, { __v: 0, _id: 0 }).exec().catch(err => {
        logger.error("models/joints/deck_card_remove/removeCardFromDeck : Erreur de lecture sur la base");
        callback("Le deck n'a pas été trouvé");
        return;
    });

    if (results.length > 1) {
        logger.warn("models/joints/deck_card_remove/removeCardFromDeck : Plus d'un deck possible pour l'id " + deckId);
        callback("Plusieurs decks possibles");
        return;
    }

    if (results[0].userId !== userId) {
        callback("Le deck n'appartient pas à cet utilisateur.");
        return;
    } else {
        if (Object.keys(DeckPartsEnum).indexOf(deckPart) === -1) {
            deckPart = DeckPartsEnum.MAIN;
        }

        this.deleteOne({
            cardId: cardId,
            deckId: deckId,
            deckPart: deckPart
        },
        (err, doc) => {
            if(err) {
                logger.error("models/joints/deck_card_remove/removeCardFromDeck : Erreur d'écriture sur la base");
                if (err.codeName === 'DuplicateKey') {
                    callback("Cette carte est déjà ajoutée au deck.");
                    return;
                }
                callback("Erreur d'écriture sur la base");
            } else {
                callback(err, "La carte a bien été retirée du deck.");
            }
        });
    }
};

async function removeAllCardsOfDeck(deckId, callback) {
    logger.debug("Méthode models/joints/deck_card_remove/removeAllCardsOfDeck");

    this.deleteMany({
        deckId: deckId
    },
    (err, doc) => {
        if(err) {
            logger.error("models/joints/deck_card_remove/removeAllCardsOfDeck : Erreur d'écriture sur la base");
            callback("Erreur d'écriture sur la base");
        } else {
            callback(err, "Les cartes du decks ont bien été retirées.");
        }
        console.log(doc)
    });
};

function removeCardFromDeckPlugin(schema, options) {
    schema.statics.removeCardFromDeck = removeCardFromDeck;
}

function removeAllCardsOfDeckPlugin(schema, options) {
    schema.statics.removeAllCardsOfDeck = removeAllCardsOfDeck;
}
  
module.exports = { removeCardFromDeckPlugin: removeCardFromDeckPlugin,
                   removeAllCardsOfDeckPlugin: removeAllCardsOfDeckPlugin };
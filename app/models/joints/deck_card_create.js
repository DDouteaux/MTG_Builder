var logger = require.main.require('./app/loader/logger');
var Deck = require.main.require('./app/models/decks/deck');
var DeckPartsEnum = require.main.require('./app/models/enums/deck_parts');

async function addCardToDeck(deckId, cardIds, count, deckPart, userId, callback) {
    logger.debug("Méthode models/decks/deck_cards/addCardToDeck");

    results = await Deck.find({ deckId: deckId }, { __v: 0, _id: 0 }).exec().catch(err => {
        logger.error("models/joints/deck_cards_create/addCardToDeck : Erreur de lecture sur la base");
        callback("Le deck n'a pas été trouvé");
        return;
    });

    if (results.length > 1) {
        logger.warn("models/joints/deck_cards_create/addCardToDeck : Plus d'un deck possible pour l'id " + deckId);
        callback("Plusieurs decks possibles");
        return;
    }

    if (results[0].userId !== userId) {
        callback("Le deck n'appartient pas à cet utilisateur.");
        return;
    } else {
        if (typeof count === 'undefined' || count == null) {
            count = 1;
        }
        if (Object.keys(DeckPartsEnum).indexOf(deckPart) === -1) {
            deckPart = DeckPartsEnum.MAIN;
        }

        let insertions = cardIds.map((cardId) => {
            return new Promise((resolve) => {
                this.findOneAndUpdate({
                    cardId: cardId,
                    deckId: deckId,
                    deckPart: deckPart
                },
                {
                    cardId: cardId,
                    count: count,
                    deckPart: deckPart
                },
                {
                    upsert: true
                },
                (err, doc) => {
                    if(err) {
                        logger.error("models/joints/deck_cards_create/addCardToDeck : Erreur d'écriture sur la base");
                        if (err.codeName === 'DuplicateKey') {
                            resolve("Cette carte est déjà ajoutée au deck.", []);
                        }
                    } else {
                        resolve(err, doc);
                    }
                });
            });
        });

        Promise.all(insertions).then((err, doc) => {
            err = err.filter(t => t != null);
            if (err.length == 0) {
                callback(null, doc);
            } else {
                callback(err.join('<br>'), doc);
            }
        })
    }
}

function addCardToDeckPlugin(schema, options) {
    schema.statics.addCardToDeck = addCardToDeck;
}
  
module.exports = { addCardToDeckPlugin: addCardToDeckPlugin };
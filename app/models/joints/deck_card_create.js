var logger = require.main.require('./app/loader/logger');
var Deck = require.main.require('./app/models/decks/deck');
var DeckPartsEnum = require.main.require('./app/models/enums/deck_parts');

async function addCardToDeck(deckId, cardIds, count, deckPart, comment, altCmc, userId, callback) {
    logger.debug("Méthode models/decks/deck_cards/addCardToDeck");

    err = []

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
    if (typeof altCmc !== "undefined" && altCmc != null && parseInt(altCmc) === NaN) {
        altCmc = null;
    }

    if (err.length > 0) {
        callback(err.join('<br/>'));
        return;
    }

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
                    deckPart: deckPart,
                    comment: comment,
                    altCmc: altCmc
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
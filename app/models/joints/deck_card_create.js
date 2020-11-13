var logger = require.main.require('./app/loader/logger');
var Deck = require.main.require('./app/models/decks/deck');
var DeckPartsEnum = require.main.require('./app/models/enums/deck_parts');

async function addCardToDeck(deckId, cardId, count, deckPart, userId, callback) {
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
        } else if (count > 4) {
            count = 4
        }
        if (Object.keys(DeckPartsEnum).indexOf(deckPart) === -1) {
            deckPart = DeckPartsEnum.MAIN;
        }

        console.log("cardId : " + cardId);
        console.log("deckId : " + deckId)
        this.findOneAndUpdate({
            cardId: cardId,
            deckId: deckId
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
                logger.error("models/joints/deck_cards_create/addCardToDeck : Erreur de lecture sur la base");
                if (err.codeName === 'DuplicateKey') {
                    callback("Cette carte est déjà ajoutée au deck.", []);
                    return;
                }
                callback("Erreur à l'ajout des cartes.", []);
                return;
            } else {
                console.log(err);
                callback(err, "La carte a été ajouté au deck " + results[0].title + ".");
            }
        });
    }
}

function addCardToDeckPlugin(schema, options) {
    schema.statics.addCardToDeck = addCardToDeck;
}
  
module.exports = { addCardToDeckPlugin: addCardToDeckPlugin };
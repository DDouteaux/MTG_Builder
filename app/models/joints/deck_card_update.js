var logger = require.main.require('./app/loader/logger');
var Deck = require.main.require('./app/models/decks/deck');
var DeckPartsEnum = require.main.require('./app/models/enums/deck_parts');

async function modifyCardCount(deckId, cardId, deckPart, count, userId, callback) {
    logger.debug("Méthode models/joints/deck_card_update/modifyCardCount");

    err = []

    if (typeof cardId === "undefined" || cardId == null || cardId == "") {
        err.push("Pas de carte fournie.");
    }
    if (typeof userId === "undefined" || userId == null || userId === "") {
        err.push("Pas d'utilisateur connecté.");
    }
    if (typeof deckId === "undefined" || deckId == null || deckId === "") {
        err.push("Pas de deck fourni.");
    }
    if (typeof deckPart === "undefined" || deckPart == null || deckPart === "") {
        err.push("Pas de partie du deck fournie.");
    }
    if (typeof count === "undefined" || count == null || parseInt(count) === "NaN" || count < 0) {
        err.push("Le nombre d'exemplaires pour cette carte n'est pas valide.");
    }

    if (err.length > 0) {
        callback(err.joint('<br/>'));
        return;
    }

    results = await Deck.find({ deckId: deckId }, { __v: 0, _id: 0 }).exec().catch(err => {
        logger.error("models/joints/deck_card_update/modifyCardCount : Erreur de lecture sur la base");
        callback("Le deck n'a pas été trouvé");
        return;
    });

    if (results.length > 1) {
        logger.warn("models/joints/deck_card_update/modifyCardCount : Plus d'un deck possible pour l'id " + deckId);
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

        this.findOneAndUpdate({
            cardId: cardId,
            deckId: deckId,
            deckPart: deckPart
        },
        {
            count: count
        },
        (err, doc) => {
            if(err) {
                logger.error("models/joints/deck_card_update/modifyCardCount : Erreur d'écriture sur la base");
                callback("Erreur d'écriture sur la base");
            } else {
                callback(err, "Le nombre d'exemplaires de cette carte a bien été mis à jour.");
            }
        });
    }
};

function modifyCardCountPlugin(schema, options) {
    schema.statics.modifyCardCount = modifyCardCount;
}
  
module.exports = { modifyCardCountPlugin: modifyCardCountPlugin };
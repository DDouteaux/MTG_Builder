var logger = require.main.require('./app/loader/logger');

async function updateField(deckId, field, value, userId, callback) {
    logger.debug("Méthode models/decks/deck_update/updateField");

    results = await this.find({ deckId: deckId }, { __v: 0, _id: 0 }).exec().catch(err => {
        logger.error("models/decks/deck_update/updateField : Erreur de lecture sur la base");
        callback("Le deck n'a pas été trouvé");
        return;
    });

    if (results.length > 1) {
        logger.warn("models/decks/deck_update/updateField : Plus d'un deck possible pour l'id " + deckId);
        callback("Plusieurs decks possibles");
        return;
    }

    if (results[0].userId !== userId) {
        callback("Le deck n'appartient pas à cet utilisateur.");
        return;
    } else {
        update_body = {};
        update_body[field] = value;
        console.log(Date.now());
        update_body['lastUpdateDate'] = Date.now();
        this.findOneAndUpdate({
            deckId: deckId
        },
        update_body,
        (err, doc) => {
            if(err) {
                logger.error("models/decks/deck_update/updateField : Erreur d'écriture sur la base");
                callback("Erreur d'écriture sur la base");
            } else {
                callback(err, "Le champ a bien été mis à jour.");
            }
        });
    }
}
  
function updateFieldPlugin(schema, options) {
    schema.statics.updateField = updateField;
}
  
module.exports = updateFieldPlugin;
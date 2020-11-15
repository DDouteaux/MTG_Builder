var logger = require.main.require('./app/loader/logger');

async function deleteDeck(deckId, userId, callback) {
    logger.debug("Méthode models/decks/deck_remove/deleteDeck");

    results = await this.find({ deckId: deckId }, { __v: 0, _id: 0 }).exec().catch(err => {
        logger.error("models/decks/deck_remove/deleteDeck : Erreur de lecture sur la base");
        callback("Le deck n'a pas été trouvé");
        return;
    });

    if (results.length > 1) {
        logger.warn("models/decks/deck_remove/deleteDeck : Plus d'un deck possible pour l'id " + deckId);
        callback("Plusieurs decks possibles");
        return;
    }

    if (results[0].userId !== userId) {
        callback("Le deck n'appartient pas à cet utilisateur.");
        return;
    } else {
        this.deleteOne({
            deckId: deckId
        }, (err, data) => {
            if(err) {
                logger.error("models/decks/deck_remove/deleteDeck : Erreur d'écriture sur la base");
                err = "Erreur lors de la suppression du deck";
            }
            callback(err, "Le deck a bien été supprimé.");

            
        });
    }
}
  
function deleteDeckPlugin(schema, options) {
    schema.statics.deleteDeck = deleteDeck;
}
  
module.exports = deleteDeckPlugin;
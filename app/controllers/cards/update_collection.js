var logger = require.main.require('./app/loader/logger');
var UserCard = require.main.require('./app/models/joints/card_user');

function updateCollection(cardsCounts, userId, callback) {
    logger.debug("Méthode models/controllers/cards/update_collection/updateCollection");
    cardsCounts = JSON.parse(JSON.stringify(cardsCounts));
    UserCard.createCardUser(cardsCounts, userId, details => {
        if (details == null) {
            logger.error("La mise à jour des données pour " + userId + " n'a pas pu avoir lieue.");
        } else {
            logger.info("Succès pour la mise à jour !");
        }
        callback(details);
    });
}

function getCollectionCountsFromIds(cardsIds, userId, callback) {
    logger.debug("Méthode models/controllers/cards/update_collection/getCollectionCountsFromIds");
    UserCard.getUserCardsById(cardsIds, userId, details => {
        if (details == null) {
            logger.error("La récupération des données pour " + userId + " n'a pas pu avoir lieue.");
        } else {
            logger.info("Succès pour la récupération des données !");
        }
        callback(details);
    });
}

module.exports = { updateCollection: updateCollection,
                   getCollectionCountsFromIds: getCollectionCountsFromIds };
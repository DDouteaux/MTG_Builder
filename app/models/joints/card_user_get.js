var logger = require.main.require('./app/loader/logger');

function getUserCardsById(cardsIds, userId, callback) {
    logger.debug("Méthode models/joints/card_user_get/getUserCardsById");
    
    try {
        this.find({
            $and: [
                {
                    cardId: {
                        $in: cardsIds
                    }
                },
                {
                    userId: userId
                }
            ]
        }).then(result => {
            callback(result)
        });
    } catch(error) {
        logger.error("Erreur lors de la récupérations des comptes de collection pour " + userId);
        logger.error(error);
        callback(null);
    }
}
  
function getUserCardsByIdPlugin(schema, options) {
    schema.statics.getUserCardsById = getUserCardsById;
}
  
module.exports = getUserCardsByIdPlugin;
var logger = require.main.require('./app/loader/logger');

function createCardUser(cardsCounts, userId, callback) {
    logger.debug("Méthode models/user__create/createUser");
    
    try {
        this.bulkWrite(
            Object.keys(cardsCounts).map(key => 
                ({
                    updateOne: {
                        filter: {
                            cardId: key,
                            userId: userId 
                        },
                        update: {
                            foil: cardsCounts[key].foil,
                            normal: cardsCounts[key].normal
                        },
                        upsert: true
                    }
                })
            )
        ).then(bulkResult => {
            callback(bulkResult)
        });
    } catch(error) {
        logger.error("Erreur lors de la mise à jour des cartes de " + userId);
        logger.error(error);
        callback(null);
    }
}
  
function createCardUserPlugin(schema, options) {
    schema.statics.createCardUser = createCardUser;
}
  
module.exports = createCardUserPlugin;
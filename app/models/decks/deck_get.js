var logger = require.main.require('./app/loader/logger');

function getDecksOfUser(userId, callback) {
    logger.debug("Méthode models/decks/deck_get/getDecksOfUser");
    this.find(
        {
            userId: userId
        },
        {
            __v: 0,
            _id: 0
        }
    ).exec(function(err, results) {
        if(err) {
            logger.error("models/decks/deck_get/getDecksOfUser : Erreur de lecture sur la base");
            callback(err, []);
        } else {
            callback(err, JSON.parse(JSON.stringify(results)));
        }
    });
}
  
function getDecksOfUserPlugin(schema, options) {
    schema.statics.getDecksOfUser = getDecksOfUser;
}
  
module.exports = getDecksOfUserPlugin;
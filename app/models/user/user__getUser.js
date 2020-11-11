var logger = require.main.require('./app/loader/logger');

function getUserData(username, callback) {
    logger.debug("Méthode models/user/user__getUser/getUserData");
    this.findOne(
        {
            username: username
        },
        {
            pseudo,
            avatar
        },
        (err, data) => {
            if(err) {
                logger.error("models/user/user__getDisplayableData : Erreur de lecture/écriture sur la base");
            } else {
                callback(err, data);
            }
        }
    )
}

function getUserDataPlugin(schema, options) {
    schema.statics.getUserData = getUserData;
}
  
module.exports = getUserDataPlugin;
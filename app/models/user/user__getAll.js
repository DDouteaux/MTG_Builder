var logger = require.main.require('./app/loader/logger');

function getAllUsers(callback) {
    logger.debug("Méthode models/user/user__getAll/getAllUsers");
    this.find(
        {},
        (err, data) => {
            if(err) {
                logger.error("models/user/user__getAll/getAllUsers : Erreur de lecture sur la base");
                callback("Erreur de connexion à la base de données.");
            } else {
                callback(err, data.map(res => {
                    return {pseudo: res.pseudo, userId: res.userId}
                }));
            }
        }
    )
}

function getAllUsersPlugin(schema, options) {
    schema.statics.getAllUsers = getAllUsers;
}
  
module.exports = getAllUsersPlugin;
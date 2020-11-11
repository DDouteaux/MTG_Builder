//Useless ?
//const md5 = require("md5");
//const User = require("./user");

var logger = require.main.require('./app/loader/logger');

function createUser(username, pseudo, avatar, pwdHash, callback) {
    logger.debug("Méthode models/user__create/createUser");
    user = this({
        userId: username,
        pseudo: pseudo,
        password: pwdHash,
        avatar: avatar
    });

    user.save(function(err, data) {
        if(err) {
            logger.error("models/user__create/createUser : Erreur de lecture/écriture sur la base");
            if (err.code === 11000) {
                logger.error("models/user__create/createUser : Nom d'utilisateur deja utilise");
                console.log(err);
                err = "Nom d'utilisateur déjà utilisé";
            } else {
                console.log(err);
                err = "Erreur lors de l'enregistrement du compte";
            }
        }
        callback(err, data);
    });
}
  
function createUserPlugin(schema, options) {
    schema.statics.create = createUser;
}
  
module.exports = createUserPlugin;
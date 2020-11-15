var logger = require.main.require('./app/loader/logger');
var User = require.main.require('./app/models/user/user');

function getAllUsers (callback) {
    logger.debug("Méthode controllers/users/getAll/getAllUser");
    User.getAllUsers((err, data) => {
        if (err) {
            callback('Problème de connexion à la base');
            return;
        } else {
            callback(err, data)
        }
    });
}

module.exports = getAllUsers
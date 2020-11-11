var logger = require.main.require('./app/loader/logger');

function getData (req, res, callback) {
    logger.debug("Méthode controllers/users/get/getData");
    callback(req.decoded);
}

module.exports = getData
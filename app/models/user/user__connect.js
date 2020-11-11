var logger = require.main.require('./app/loader/logger');

function connect(username, pwdHash, callback) {
    logger.debug("Méthode models/user__connect/connect");
    this.findOne(
        {
            userId: username,
            password: pwdHash
        },
        function(err, data) {
            if(err) {
                logger.error("models/user__connect/connect : Erreur de lecture/écriture sur la base");
            }
            callback(err, data);
        }
    );
}
  
function connectUserPlugin(schema, options) {
    schema.statics.connect = connect;
}
  
module.exports = connectUserPlugin;
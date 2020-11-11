var logger = require.main.require('./app/loader/logger');

function disconnectUser(type, callback) {
    logger.debug("Méthode user__disconnect/disconnectUser");
    this.isConnected = false;
    this.save(callbak);
}
  
function disconnectUserPlugin(schema, options) {
    schema.methods.disconnect = disconnectUser;
}
  
module.exports = disconnectUserPlugin;
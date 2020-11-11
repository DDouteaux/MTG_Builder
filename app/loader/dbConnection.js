// Database connexion to MongoDB
var config = require.main.require('./app/config/config');
var logger = require.main.require('./app/loader/logger');
var mongoose = require('mongoose');

logger.info("Connexion à la base de données");
var dbUrl = "mongodb://" 
                + config.db.user + ":" 
                + encodeURIComponent(config.db.pwd) + "@" 
                + config.db.url + ":" 
                + config.db.port + "/" 
                + config.db.table;

mongoose.connect(
    dbUrl,
    { 
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true
     }, 
     (err) => {
        if (err) {
            logger.error("Erreur lors de la connexion à la base de données.");
            logger.error(err);
            process.exit();
        } else {
            logger.info("Connexion à la base de données établie.");
        }
    }
)
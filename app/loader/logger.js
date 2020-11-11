var logger = exports;
var config = require.main.require('./app/config/config');
var levels = ['debug', 'route', 'info', 'warn', 'error'];
const chalk = require('chalk');
const log = console.log;

logger.initLogs = function() {
    console.log("=================================================");
    console.log("                    NIV-MIZZET                   ");
    console.log("               DÉMARRAGE DU SERVEUR              ");
    console.log("=================================================\n\n");
    logger.debug("Ceci est un exemple de log de debug.");
    logger.route("Ceci est un exemple de log de routage.");
    logger.info("Ceci est un exemple de log d'information.");
    logger.warn("Ceci est un exemple de log de warning.");
    logger.error("Ceci est un exemple de log d'erreur.\n\n");
}

logger.getMessage = function(level, message, callback) {
    if (levels.indexOf(level) >= levels.indexOf(config.log.level) ) {
        if (typeof message !== 'string') {
            message = JSON.stringify(message);
        };
        callback(message);
    }
}

logger.debug = function(message) {
    logger.getMessage('debug', message, function(strMessage) {
        if (strMessage) {
            log(chalk.gray.bold('[DEBUG] ') + chalk.gray(strMessage));
        }
    });
}

logger.route = function(message) {
    logger.getMessage('route', message, function(strMessage) {
        if (strMessage) {
            log(chalk.green.bold('[ROUTE] ') + chalk.green(strMessage));
        }
    });
}

logger.info = function(message) {
    logger.getMessage('info', message, function(strMessage) {
        if (strMessage) {
            log(chalk.magenta.bold('[INFO]  ') + chalk.magenta(strMessage));
        }
    });
}

logger.warn = function(message) {
    logger.getMessage('warn', message, function(strMessage) {
        if (strMessage) {
            log(chalk.yellow.bold('[WARN]  ') + chalk.yellow(strMessage));
        }
    });
}

logger.error = function(message) {
    logger.getMessage('error', message, function(strMessage) {
        if (strMessage) {
            log(chalk.red.bold('[ERROR] ') + chalk.red(strMessage));
        }
    });
}
var logger = require.main.require('./app/loader/logger');
var es = require.main.require('./app/loader/esConnection');

function getAll(callback) {
    logger.debug("Méthode models/controllers/symbols/getAll");
    es.client.search({  
        index: 'symbols',
        body: {
            size: 1000,
            query: {
                match_all: {}
            }
        }
    }, (err, res, status) => {
        symbols = {};
        if (err) {
            logger.error("Erreur lors de la récupération des symboles");
            logger.error(err);
        } else {
            res.hits.hits.forEach(hit => {
                symbols[hit._source.symbol] = hit._source.symbolFileName;
            });
        }
        callback(symbols);
    });
}

module.exports = { getAll: getAll };
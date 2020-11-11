var logger = require.main.require('./app/loader/logger');
var elasticsearch = require('elasticsearch');
const fs = require('fs');

var client = new elasticsearch.Client( {  
  hosts: [
    'http://localhost:9200/'
  ]
});

function initIndices() {
    logger.debug("Méthode loader/esConnection/initIndices");
    initIndex("sets");
    initIndex("cards");
    initIndex("decks");
}

function initIndex(indexName) {
    logger.debug("Méthode loader/esConnection/initIndex");
    logger.info("Création de l'index " + indexName);
    client.indices.exists({
        index: indexName
    }, (err, res, status) => {
        if (!res) {
            logger.info("Création de l'index " + indexName + " pour la liste des extensions.");
            client.indices.create({  
                index: indexName
            }, (err, resp, status) => {
                if(err) {
                    logger.error("Erreur lors de la création de l'index " + indexName);
                    logger.error(err);
                    return;
                }
                
                fs.readFile('app/config/es/mapping_' + indexName + '.json', 'utf8', function(err, data){
                    if (err) {
                        logger.error("Erreur lors de la lecture du fichier de mapping mapping_" + indexName + ".json");
                        logger.error(err);
                        return;
                    }
                    
                    client.indices.putMapping({
                        index: indexName,
                        body: data
                    }, (err, res, status) => {
                        if(err) {
                            logger.error("Erreur lors de l'import du mapping pour " + indexName);
                            logger.error(err);
                            return;
                        }
                        
                        logger.info("Import du mapping de l'index " + indexName + " réalisée avec succès");
                    });
                });
            });
        } else {
            logger.info("L'index " + indexName + " existe déjà")
        }
    })
}

module.exports = { client: client,
                   init: initIndices() };
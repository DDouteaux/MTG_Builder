var logger = require.main.require('./app/loader/logger');
var es = require.main.require('./app/loader/esConnection');
var Card = require.main.require('./app/models/cards/card');
var esb = require('elastic-builder');

function getDisplayableSets(callback) {
    logger.debug("Méthode models/controllers/sets/getDisplayableSets");
    const getAllSetsBody = esb.requestBodySearch()
                           .query(esb.matchAllQuery())
                           .size(10000);
    es.client.search({
        index: 'sets',
        body: getAllSetsBody.toJSON()},
        (err, res, status) => {
            sets = []
            if (err) {
                logger.error("Erreur lors de la récupération de la liste des éditions");
                logger.error(err);
            }
            else {
                logger.info("Récupération de la liste des éditions réalisée avec succès.")
                res.hits.hits.forEach(hit => {
                sets.push(hit._source);
                });
            }
            callback(sets);
    });
}

function getAllData(setCode, callback) {
    logger.debug("Méthode models/controllers/sets/getAllData");
    const findSetBody = esb.requestBodySearch()
                            .query(esb.termQuery('code', setCode))
                            .size(1);
    es.client.search({
        index: 'sets',
        body: findSetBody.toJSON()},
        (err, res, status) => {
        if (err) {
            logger.error("Erreur lors de la récupération des informations de " + setCode);
            logger.error(err);
            callback();
            return;
        }
        if (res.hits.length == 0) {
            callback();
            return;
        }
        set = res.hits.hits[0]._source;
        const getAllCardsFromSet = esb.requestBodySearch()
                                        .query(esb.termQuery('set', setCode))
                                        .size(10000);
        es.client.search({
            index: 'cards',
            body: getAllCardsFromSet.toJSON()},
            (err, res, status) => {
            if (err) {
                logger.error("Erreur lors de la récupération des cartes de " + setCode);
                logger.error(err);
                callback(set, []);
            }
            cards = []
            res.hits.hits.forEach(hit => {
                card = new Card(hit._source);
                card._id = hit._id
                cards.push(card);
            });
            callback(set, cards);
        });
    });
}

module.exports = { getSets: getDisplayableSets,
                   getAllData: getAllData };
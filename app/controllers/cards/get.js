var logger = require.main.require('./app/loader/logger');
var es = require.main.require('./app/loader/esConnection');
var Card = require.main.require('./app/models/cards/card');
var esb = require('elastic-builder');

function getCard(_id, callback) {
    logger.debug("Méthode models/controllers/cards/getCard");
    const getAllSetsBody = esb.requestBodySearch()
                                .query(esb.termQuery('_id', _id));
    es.client.search({  
        index: 'cards',
        body: getAllSetsBody.toJSON()
    }, (err, res, status) => {
        sets = []
        if (err) {
            logger.error("Erreur lors de la récupération de la carte " + _id);
            logger.error(err);
            callback();
            return;
        }
        else {
            card = {}
            if (res.hits.hits.length > 1) {
                logger.warn("Plusieurs résultats pour l'id " + _id);
                card = res.hits.hits[0]._source;
            } else if (res.hits.hits.length == 0) {
                logger.warn("Pas de résultats pour l'id " + _id);
                callback();
                return;
            } else {
                card = res.hits.hits[0]._source;
            }
            card.id = _id;
            callback(card);
        }
    });
}

function getCards(ids, callback) {
    logger.debug("Méthode models/controllers/cards/getCards");
    const getAllSetsBody = esb.requestBodySearch()
                                .query(esb.termsQuery('_id', ids));
    logger.info(JSON.stringify(getAllSetsBody.toJSON()));
    es.client.search({  
        index: 'cards',
        size: 1000,
        body: getAllSetsBody.toJSON()
    }, (err, res, status) => {
        sets = []
        if (err) {
            logger.error("Erreur lors de la récupération des cartes : " + ids);
            logger.error(err);
            callback();
            return;
        }
        else {
            cards = []
            if (res.hits.hits.length > 0) {
                res.hits.hits.forEach(hit => {
                    card = hit._source;
                    card.id = hit._id;
                    cards.push(card);
                })
            }
            callback(null, cards);
        }
    });
}

function getAllCards(callback) {
    logger.debug("Méthode models/controllers/cards/getAllCards");
    const finAllCardsUnique = esb.requestBodySearch()
                                    .query(esb.termQuery('reprint', false))
                                    .size(10000);
    es.client.search({  
        index: 'cards',
        body: finAllCardsUnique.toJSON()
    }, (err, res, status) => {
        cards = []
        res.hits.hits.forEach(hit => {
            card = new Card(hit._source);
            card._id = hit._id
            cards.push(card);
        });
        callback(cards);
    });
}

function search(params, callback) {
    logger.debug("Méthode models/controllers/cards/search");
    const globalSearchQuery = esb.requestBodySearch()
                                    .query(esb.boolQuery()
                                              .must(esb.matchQuery('name', params.searchString))
                                              .must(esb.termQuery('reprint', false))
                                              .must(esb.termQuery('promo', false))
                                              .must(esb.termQuery('variation', false)))
                                    .size(10000);

    es.client.search({  
        index: 'cards',
        body: globalSearchQuery.toJSON()
    }, (err, res, status) => {
        cards = []
        names = []
        if (res.hits && res.hits.hits) {
            res.hits.hits.forEach(hit => {
                card = new Card(hit._source);
                card._id = hit._id
                cards.push(card);
            });

            cards.map(card => {
                if (!names.includes(card.name)) {
                    names.push(card.name);
                }
            })

            filtered_cards = cards.filter(card => {
                return !card.frame_effects.includes("showcase") && !card.frame_effects.includes("extendedart");
            })

            if (filtered_cards.length != names.length) {
                names.forEach(name => {
                    filtered_cards.push(cards.filter(card => card.name === name)[0]);
                })
            }
            callback(filtered_cards);
        }

    });
}

function getAllVersionFromName(cardName, callback) {
    logger.debug("Méthode models/controllers/cards/get/getAllVersionFromName");
    const getAllVersionsSearchQuery = esb.requestBodySearch()
                                    .query(esb.termQuery('name.keyword', cardName))
                                    .size(10000);

    console.log(JSON.stringify(getAllVersionsSearchQuery.toJSON()));
    es.client.search({  
        index: 'cards',
        body: getAllVersionsSearchQuery.toJSON()
    }, (err, res, status) => {
        cards = []
        if (res.hits && res.hits.hits) {
            res.hits.hits.forEach(hit => {
                card = new Card(hit._source);
                card._id = hit._id
                cards.push(card);
            });

            callback(cards);
        }
    });
}

function randomCard(callback) {
    logger.debug("Méthode models/controllers/cards/getCard");
    es.client.search({
        index: 'cards',
        body: {
            size: 1,
            query: {
               function_score: {
                  functions: [
                     {
                        random_score: {
                           seed: Math.floor(Math.random() * (1000000000 - 1))
                        }
                     }
                  ]
               }
            }
         }
    }, (err, res, status) => {
        sets = []
        if (err) {
            logger.error("Erreur lors de la récupération aléatoire d'une carte");
            logger.error(err);
            return;
        }
        else {
            card = {};
            card = res.hits.hits[0]._source;
            card.id = res.hits.hits[0]._id;
            callback(card);
        }
    });
}

function advanced_search(searchParams, callback) {
    logger.debug("Méthode models/controllers/cards/getCard");
    // Si besoin, réécriture des paramètres en entrée de la recherche
    cardName = searchParams.name;
    text = searchParams.text;
    textAmb = searchParams.textAmb;
    cmc = searchParams.cmc;
    frameEffect = searchParams.frame_effect;
    versions = searchParams.versions;
    colorIdentityConstraint = searchParams.colorIdentityConstraint;
    types = convert_to_array(searchParams.types);
    subTypes = convert_to_array(searchParams.subTypes);
    keywords = convert_to_array(searchParams.keywords);
    sets = convert_to_array(searchParams.sets);
    rarity = convert_to_array(searchParams.rarity);
    edhIdentity = convert_to_array(searchParams.edhIdentity);

    // Création de la bool query à partir des paramètres.
    const advancedSearchBoolQuery = esb.boolQuery();
    add_must_match_clause_for_string('name', cardName, advancedSearchBoolQuery);
    add_must_match_clause_for_string('oracle_text', text, advancedSearchBoolQuery);
    add_must_match_clause_for_string('flavor_text', textAmb, advancedSearchBoolQuery);
    add_must_term_clause_for_arrays('type', types, advancedSearchBoolQuery);
    add_must_term_clause_for_arrays('subType', subTypes, advancedSearchBoolQuery);
    add_filter_clause_for_arrays('set', sets, advancedSearchBoolQuery);
    add_must_term_clause_for_arrays('rarity', rarity, advancedSearchBoolQuery);
    add_must_term_clause_for_arrays('keywords', keywords, advancedSearchBoolQuery);
    add_must_term_clause_for_string('frame_effects', frameEffect, advancedSearchBoolQuery);
    if (edhIdentity != 'undefined' && edhIdentity != null && edhIdentity.length > 0) {
        not_chosen_colors = ['W', 'U', 'B', 'R', 'G'].filter(x => !edhIdentity.includes(x));
        const colorIdentityBoolQuery = esb.boolQuery();
        const subEqualBoolQuery1 = esb.boolQuery();
        const subEqualBoolQuery2 = esb.boolQuery();
        switch (colorIdentityConstraint) {
            case "equal":
                add_must_term_clause_for_arrays('color_identity', ['C'], subEqualBoolQuery1);
                add_must_term_clause_for_arrays('color_identity', edhIdentity, subEqualBoolQuery2);
                add_musnt_match_clause_for_arrays('color_identity', not_chosen_colors, subEqualBoolQuery2);
                colorIdentityBoolQuery.should(subEqualBoolQuery1);
                colorIdentityBoolQuery.should(subEqualBoolQuery2);
                break;
            case "among":
                if (!edhIdentity.includes('C')) {
                    edhIdentity.push('C');
                }
                add_should_match_clause_for_arrays('color_identity', edhIdentity, colorIdentityBoolQuery);
                add_musnt_match_clause_for_arrays('color_identity', not_chosen_colors, colorIdentityBoolQuery);
                break;
            case "with":
                add_must_term_clause_for_arrays('color_identity', ['C'], subEqualBoolQuery1);
                add_must_term_clause_for_arrays('color_identity', edhIdentity, subEqualBoolQuery2);
                colorIdentityBoolQuery.should(subEqualBoolQuery1);
                colorIdentityBoolQuery.should(subEqualBoolQuery2);
                break;
        }
        advancedSearchBoolQuery.must(colorIdentityBoolQuery);
    }
    if (typeof versions != 'undefined' && versions != null) {
        switch (versions) {
            case "firstEdition":
                advancedSearchBoolQuery.filter(esb.termQuery('reprint', false));
                break;
            case "all": 
                advancedSearchBoolQuery.filter(esb.termsQuery('reprint', [false, true]));
                break;
        }
    }
    const advancedSearchQuery = esb.requestBodySearch()
                                    .query(advancedSearchBoolQuery)
                                    .size(10000);
    logger.info("Requête exécutée :");
    logger.info(JSON.stringify(advancedSearchBoolQuery.toJSON()));

    es.client.search({
        index: 'cards',
        body: advancedSearchQuery.toJSON()
    }, (err, res, status) => {
        cards = []
        if (res.hits && res.hits.hits) {
            alreadySeenNames = [];
            res.hits.hits.forEach(hit => {
                if (versions != "noDouble" || !alreadySeenNames.includes(hit._source.name)) {
                    alreadySeenNames.push(hit._source.name);
                    card = new Card(hit._source);
                    card._id = hit._id;
                    cards.push(card);
                }
            });
        }
        callback(cards);
    });
}

function convert_to_array(value) {
    if (typeof value === "string" && value != null && value != '') {
        return [ value ];
    } else if (value === null || value === '') {
        return [];
    } else {
        return value;
    }
}

function add_musnt_match_clause_for_arrays(key, values, advancedSearchBoolQuery) {
    if (values && values.length > 0) {
        values.forEach(value => {
            advancedSearchBoolQuery.mustNot(esb.matchQuery(key, value));
        })
    }
}

function add_should_match_clause_for_arrays(key, values, advancedSearchBoolQuery) {
    if (values && values.length > 0) {
        values.forEach(value => {
            advancedSearchBoolQuery.should(esb.matchQuery(key, value));
        })
    }
}

function add_must_term_clause_for_arrays(key, values, advancedSearchBoolQuery) {
    if (values && values.length > 0) {
        values.forEach(value => {
            advancedSearchBoolQuery.must(esb.termQuery(key + ".keyword", value));
        })
    }
}

function add_must_match_clause_for_string(key, value, advancedSearchBoolQuery) {
    if (typeof value != 'undefined' && value != null && value.trim().length > 0) {
        advancedSearchBoolQuery.must(esb.matchQuery(key, value));
    }
}

function add_must_term_clause_for_string(key, value, advancedSearchBoolQuery) {
    if (typeof value != 'undefined' && value != null && value.trim().length > 0) {
        advancedSearchBoolQuery.must(esb.matchQuery(key, value));
    }
}

function add_filter_clause_for_arrays(key, values, advancedSearchBoolQuery) {
    if (typeof values != 'undefined' && values.length > 0) {
        termsQuery = esb.termsQuery(key, values);
        advancedSearchBoolQuery.filter(termsQuery);
    }
}

module.exports = { getCard: getCard,
                   getCards: getCards,
                   getAllCards: getAllCards,
                   search: search,
                   randomCard: randomCard,
                   advanced_search: advanced_search,
                   getAllVersionFromName: getAllVersionFromName };
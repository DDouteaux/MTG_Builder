var logger = require.main.require('./app/loader/logger');
var es = require.main.require('./app/loader/esConnection');
var esb = require('elastic-builder');

function getAllTypes(callback) {
    logger.debug("Méthode models/controllers/cards/aggregations/getAllTypes");
    const getAllTypesBody = esb.requestBodySearch()
                                .size(0)
                                .agg(esb.termsAggregation('types', 'type.keyword').size(10000));

    es.client.search({  
        index: 'cards',
        body: getAllTypesBody.toJSON()
    }, (err, res, status) => {
        types = [];
        res.aggregations.types.buckets.forEach(aggregation => {
            types.push(aggregation.key);
        })
        callback(types);
    });
}

function getAllSubTypes(callback) {
    logger.debug("Méthode models/controllers/cards/aggregations/getAllTypes");
    const getAllSubTypesBody = esb.requestBodySearch()
                                    .size(0)
                                    .agg(esb.termsAggregation('subTypes', 'subType.keyword').size(10000));

    es.client.search({  
        index: 'cards',
        body: getAllSubTypesBody.toJSON()
    }, (err, res, status) => {
        subTypes = [];
        res.aggregations.subTypes.buckets.forEach(aggregation => {
            subTypes.push(aggregation.key);
        })
        callback(subTypes);
    });
}

function getAllEffects(callback) {
    logger.debug("Méthode models/controllers/cards/aggregations/getAllEffects");
    const getAllEffectsBody = esb.requestBodySearch()
                                    .size(0)
                                    .agg(esb.termsAggregation('frame_effects', 'frame_effects.keyword').size(10000));

    es.client.search({  
        index: 'cards',
        body: getAllEffectsBody.toJSON()
    }, (err, res, status) => {
        effects = [];
        res.aggregations.frame_effects.buckets.forEach(aggregation => {
            effects.push(aggregation.key);
        })
        callback(effects);
    });
}

function getAllKeywords(callback) {
    logger.debug("Méthode models/controllers/cards/aggregations/getAllKeywords");
    const getAllEffectsBody = esb.requestBodySearch()
                                    .size(0)
                                    .agg(esb.termsAggregation('keywords', 'keywords.keyword').size(10000));

    es.client.search({  
        index: 'cards',
        body: getAllEffectsBody.toJSON()
    }, (err, res, status) => {
        keywords = [];
        res.aggregations.keywords.buckets.forEach(aggregation => {
            keywords.push(aggregation.key);
        })
        callback(keywords);
    });
}

module.exports = { getAllTypes: getAllTypes,
                   getAllSubTypes: getAllSubTypes,
                   getAllEffects: getAllEffects,
                   getAllKeywords: getAllKeywords };
var sets_get = require.main.require('./app/controllers/sets/get');
var symbols = require.main.require('./app/controllers/symbols/get');
var logger = require.main.require('./app/loader/logger');
var deck_get = require.main.require('./app/controllers/decks/get');
var cards_collection = require.main.require('./app/controllers/cards/update_collection');

module.exports = function(app, baseDir) {
    app.get('/sets', (req, res) => {
        logger.route("GET /sets");
        sets_get.getSets(sets => {
            res.render('partials/sets/list', { sets: sets });
        });
    })

    app.get('/sets/:code', (req, res) => {
        logger.route("GET /sets/" + req.params.code);
        sets_get.getAllData(req.params.code, (set, cards) => {
            symbols.getAll(symbols => {
                if (typeof req.decoded != undefined && req.decoded != null) {
                    deck_get.getDecksOfUser(req.decoded.username, true, (err, decks) => {
                        cardsIds = cards.map(card => card._id);
                        cards_collection.getCollectionCountsFromIds(cardsIds, req.decoded.username, collectionCounts => {
                            res.render('partials/sets/detail', {
                                set: set,
                                cards: cards,
                                symbols: symbols,
                                decks: decks,
                                counts: collectionCounts,
                            });
                        });
                    });
                } else {
                    res.render('partials/sets/detail', {
                        set: set,
                        cards: cards,
                        symbols: symbols
                    });
                }
            })
        })
    })
}
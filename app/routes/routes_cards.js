var cards = require.main.require('./app/controllers/cards/get');
var cards_collection = require.main.require('./app/controllers/cards/update_collection');
var cardsHelp = require.main.require('./app/controllers/cards/aggregations');
var deck_get = require.main.require('./app/controllers/decks/get')
var sets = require.main.require('./app/controllers/sets/get');
var symbols = require.main.require('./app/controllers/symbols/get');
var logger = require.main.require('./app/loader/logger');

module.exports = function(app, baseDir) {
    app.get('/cards', (req, res) => {
        logger.route("GET /cards/");
        symbols.getAll(symbols => {
            cards.getAllCards(cards => {
                if (typeof req.decoded != undefined && req.decoded != null) {
                    deck_get.getDecksOfUser(req.decoded.username, true, (err, decks) => {
                        res.render('partials/cards/list', {
                            title: "Explorer toutes les cartes",
                            cards: cards,
                            symbols: symbols,
                            isCollection: false,
                            decks: decks
                        });
                    });
                } else {
                    res.render('partials/cards/list', {
                        title: "Explorer toutes les cartes",
                        cards: cards,
                        symbols: symbols,
                        isCollection: false
                    });
                }
            });
        });
    });

    app.get('/cards/search', (req, res) => {
        logger.route("GET /cards/search");
        symbols.getAll(symbols => {
            cards.search(req.query, cards => {
                if (typeof req.decoded != undefined && req.decoded != null) {
                    deck_get.getDecksOfUser(req.decoded.username, true, (err, decks) => {
                        res.render('partials/cards/list', {
                            title: "Résultats de la recherche",
                            cards: cards,
                            symbols: symbols,
                            isCollection: false,
                            decks: decks
                        });
                    });
                } else {
                    res.render('partials/cards/list', {
                        title: "Résultats de la recherche",
                        cards: cards,
                        symbols: symbols,
                        isCollection: false
                    });
                }
            });
        });
    })

    app.get('/cards/advanced_search', (req, res) => {
        logger.route("GET /cards/advanced_search");
        symbols.getAll(symbols => {
            if (JSON.stringify(req.query) === JSON.stringify({})) {
                sets.getSets(sets => {
                    cardsHelp.getAllTypes(types => {
                        cardsHelp.getAllSubTypes(subTypes => {
                            cardsHelp.getAllKeywords(keywords => {
                                cardsHelp.getAllEffects(effects => {
                                    res.render('partials/cards/advanced_search', {
                                        symbols: symbols,
                                        sets: sets,
                                        types: types,
                                        subTypes: subTypes,
                                        keywords: keywords,
                                        effects: effects
                                    });
                                })
                            });
                        });
                    });
                });
            } else {
                cards.advanced_search(req.query, cards => {
                    if (typeof req.decoded != undefined && req.decoded != null) {
                        deck_get.getDecksOfUser(req.decoded.username, true, (err, decks) => {
                            res.render('partials/cards/list', {
                                title: "Résultats de la recherche",
                                cards: cards,
                                symbols: symbols,
                                isCollection: false,
                                decks: decks
                            });
                        });
                    } else {
                        res.render('partials/cards/list', {
                            title: "Résultats de la recherche",
                            cards: cards,
                            symbols: symbols,
                            isCollection: false
                        });
                    }
                });
            }
        });
    })

    app.get('/cards/random', (req, res) => {
        logger.route("GET /cards/random");
        symbols.getAll(symbols => {
            cards.randomCard(card => {
                sets.getSets(sets => {
                    cards.getAllVersionFromName(card.name, otherPrints => {
                        if (typeof req.decoded != undefined && req.decoded != null) {
                            deck_get.getDecksOfUser(req.decoded.username, true, (err, decks) => {
                                cardsIds = [ card.id ]
                                userId = req.decoded['username']
                                cards_collection.getCollectionCountsFromIds(cardsIds, userId, collectionCounts => {
                                    if (typeof colectionCounts != 'undefined' && colectionCounts.length > 0) {
                                        res.render('partials/cards/detail', {
                                            card: card,
                                            symbols: symbols,
                                            count: collectionCounts[0],
                                            sets: sets,
                                            decks: decks,
                                            otherPrints: otherPrints
                                        });
                                    } else {
                                        res.render('partials/cards/detail', {
                                            card: card,
                                            symbols: symbols,
                                            sets: sets,
                                            decks: decks,
                                            otherPrints: otherPrints
                                        });
                                    }
                                });
                            });
                        } else {
                            res.render('partials/cards/detail', {
                                card: card,
                                symbols: symbols,
                                sets: sets,
                                otherPrints: otherPrints
                            });
                        }
                    })
                });
            });
        });
    });

    app.get('/cards/:id', (req, res) => {
        logger.route("GET /cards/" + req.params.id);
        symbols.getAll(symbols => {
            cards.getCard(req.params.id, card => {
                sets.getSets(sets => {
                    if (card != 'undefined' && card != null) {
                        if (['p', 't'].includes(card.set[0])) {
                            card.setIcon = card.set.substring(1, card.set.length);
                        } else {
                            card.setIcon = card.set.substring(card.set.lastIndexOf('/') + 1)
                        }
                        cards.getAllVersionFromName(card.name, otherPrints => {
                            if (typeof req.decoded != undefined && req.decoded != null) {
                                    deck_get.getDecksOfUser(req.decoded.username, true, (err, decks) => {
                                    cardsIds = [ card.id ]
                                    userId = req.decoded['username']
                                    cards_collection.getCollectionCountsFromIds(cardsIds, userId, collectionCounts => {
                                        if (collectionCounts.length > 0) {
                                            res.render('partials/cards/detail', {
                                                card: card,
                                                symbols: symbols,
                                                sets: sets,
                                                count: JSON.parse(JSON.stringify(collectionCounts[0])),
                                                decks: decks,
                                                otherPrints: otherPrints
                                            });
                                        } else {
                                            res.render('partials/cards/detail', {
                                                card: card,
                                                symbols: symbols,
                                                sets: sets,
                                                decks: decks,
                                                otherPrints: otherPrints
                                            });
                                        }
                                    });
                                });
                            } else {
                                res.render('partials/cards/detail', {
                                    card: card,
                                    symbols: symbols,
                                    sets: sets,
                                    otherPrints: otherPrints
                                });
                            }
                        });
                    } else {
                        res.redirect('/cards/advanced_search');
                    }
                });
            });
        });
    })
}
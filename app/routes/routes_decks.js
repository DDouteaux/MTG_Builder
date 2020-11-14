var cards = require.main.require('./app/controllers/cards/get');
var deck_modify = require.main.require('./app/controllers/decks/modify');
var deck_create = require.main.require('./app/controllers/decks/create');
var deck_get = require.main.require('./app/controllers/decks/get')
var formats = require.main.require('./app/models/enums/formats');
var deck_parts = require.main.require('./app/models/enums/deck_parts');
var states = require.main.require('./app/models/enums/states');
var logger = require.main.require('./app/loader/logger');
var symbols = require.main.require('./app/controllers/symbols/get');

module.exports = function(app, baseDir) {
    app.get('/decks', (req, res) => {
        logger.route("GET /decks");
        deck_get.getPublicDecks((err, decks) => {
            if (typeof err === 'undefined' || err == null) {
                res.render('partials/decks/list', { public: true, formats: formats, states: states, decks: decks });
            } else {
                res.render('partials/decks/list', { public: true, formats: formats, states: states, decks: [] });
            }
        });
    })

    app.get('/decks/:id', (req, res) => {
        logger.route("GET /decks/:id");
        deck_get.getDeckById(req.params.id, (err, deck) => {
            if ((typeof err === 'undefined' || err == null) 
                && typeof req.decoded != 'undefined' && req.decoded != null 
                && deck.userId === req.decoded.username) {
                deck_get.getCardsFromDeck(req.params.id, req.decoded.username, (err, deckCards) => {
                    if (typeof err === 'undefined' || err == null) {
                        cardIds = deckCards.map(dc => dc.cardId);
                        cards.getCards(cardIds, (err, cards) => {
                            if (typeof err === 'undefined' || err == null) {
                                cards.forEach(card => {
                                    dc = deckCards.filter(dc => dc.cardId === card.id)[0];
                                    card.count = dc.count;
                                    card.deckPart = dc.deckPart;
                                });
                                symbols.getAll(symbols => {
                                    res.render('partials/decks/detail', { formats: formats, states: states, deck: deck, cards: cards, user: req, deck_parts: deck_parts, symbols: symbols });
                                });
                            } else {
                                res.redirect('/?error=' + err);
                            }
                        });
                    } else {
                        res.redirect('/?error=' + err);
                    }
                });
            } else if (err != null) {
                res.redirect('/?error=' + err);
            } else if (!deck.public) {
                res.redirect('/?error=La page demandée n\'existe pas.');
            } else {
                cardIds = deckCards.map(dc => dc.cardId);
                cards.getCards(cardIds, (err, cards) => {
                    if (typeof err === 'undefined' || err == null) {
                        cards.forEach(card => {
                            dc = deckCards.filter(dc => dc.cardId === card.id)[0];
                            card.count = dc.count;
                            card.deckPart = dc.deckPart;
                        });
                        symbols.getAll(symbols => {
                            res.render('partials/decks/detail', { formats: formats, states: states, deck: deck, cards: cards, user: req, deck_parts: deck_parts, symbols: symbols });
                        });
                    } else {
                        res.redirect('/?error=' + err);
                    }
                });
            }
        });
    })

    app.get('/user/decks', (req, res) => {
        logger.route("GET /user/decks");
        if (typeof req.decoded !== 'undefined' && req.decoded != null) {
            deck_get.getDecksOfUser(req.decoded.username, false, (err, decks) => {
                if (typeof err === 'undefined' || err == null) {
                    res.render('partials/users/deck_list', { formats: formats, states: states, decks: decks });
                } else {
                    res.render('partials/users/deck_list', { formats: formats, states: states, decks: [] });
                }
            });
        }
    })

    app.post('/user/decks', (req, res) => {
        logger.route("POST /user/decks");
        request = req.body;
        user = req.decoded;
        deck_create.createDeck(request.title, "Brouillon", request.format, user.username, request.source, request.description, [], (err, result) => {
            res.redirect('/decks/' + result.deckId);
        })
    })

    app.post('/decks/addCard', (req, res) => {
        decks = [];
        if (typeof req.body != 'undefined' || req.body != null 
            && typeof req.body.decks != 'undefined' && req.body.decks != null && req.body.decks != '') {
            if (typeof req.body.decks === "string") {
                decks.push(req.body.decks);
            } else {
                decks = req.body.decks
            }
        }
        if (decks.length > 0) {
            deck_modify.addCardToDeck(req.body.decks, req.body.cardId, req.body.count, req.body.deckPart, req.decoded.username, (err, data) => {
                if (typeof err === 'undefined' || err == null) {
                    res.status(200).send({message: data});
                } else {
                    res.status(400).send({message: err});
                }
            });
        } else {
            res.status(400).send({message: "Pas de decks fourni"});
        }
    })
}
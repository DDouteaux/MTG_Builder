var cards = require.main.require('./app/controllers/cards/get');
var deck_modify = require.main.require('./app/controllers/decks/modify');
var deck_create = require.main.require('./app/controllers/decks/create');
var deck_get = require.main.require('./app/controllers/decks/get')
var display_deck_parts_enum = require.main.require('./app/models/enums/display_deck_parts')
var logger = require.main.require('./app/loader/logger');
var symbols = require.main.require('./app/controllers/symbols/get');

module.exports = function(app, baseDir) {
    app.get('/decks', (req, res) => {
        logger.route("GET /decks");
        deck_get.getPublicDecks((err, decks) => {
            if (typeof err === 'undefined' || err == null) {
                res.render('partials/decks/list', {
                    public: true,
                    decks: decks
                });
            } else {
                res.render('partials/decks/list', {
                    public: true,
                    decks: []
                });
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
                                finalCards = []
                                deckCards.forEach(deckCard => {
                                    finalCards.push({
                                        count: deckCard.count,
                                        deckPart: deckCard.deckPart,
                                        ...cards.filter(card => card.id === deckCard.cardId)[0]
                                    })
                                });
                                symbols.getAll(symbols => {
                                    res.render('partials/decks/detail', {
                                        deck: deck,
                                        cards: finalCards,
                                        user: req,
                                        symbols: symbols,
                                        display_deck_parts_enum: display_deck_parts_enum
                                    });
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
                deck_get.getCardsFromDeck(req.params.id, deck.userId, (err, deckCards) => {
                    cardIds = deckCards.map(dc => dc.cardId);
                    cards.getCards(cardIds, (err, cards) => {
                        if (typeof err === 'undefined' || err == null) {
                            cards.forEach(card => {
                                dc = deckCards.filter(dc => dc.cardId === card.id)[0];
                                card.count = dc.count;
                                card.deckPart = dc.deckPart;
                            });
                            symbols.getAll(symbols => {
                                res.render('partials/decks/detail', {
                                    deck: deck,
                                    cards: cards,
                                    user: req,
                                    symbols: symbols,
                                    display_deck_parts_enum: display_deck_parts_enum
                                });
                            });
                        } else {
                            res.redirect('/?error=' + err);
                        }
                    });
                });
            }
        });
    })

    app.get('/user/decks', (req, res) => {
        logger.route("GET /user/decks");
        if (typeof req.decoded !== 'undefined' && req.decoded != null) {
            deck_get.getDecksOfUser(req.decoded.username, false, (err, decks) => {
                if (typeof err === 'undefined' || err == null) {
                    res.render('partials/users/deck_list', {
                        decks: decks
                    });
                } else {
                    res.render('partials/users/deck_list', {
                        decks: []
                    });
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
        logger.route("POST /user/addCard");
        if (typeof req.decoded === 'undefined' || req.decoded == null) {
            res.redirect('/?error=Vous devez être connecté pour réaliser cette action.');
        }
        decks = [];
        if (typeof req.body != 'undefined' || req.body != null 
            && typeof req.body.decks != 'undefined' && req.body.decks != null && req.body.decks != '') {
            if (typeof req.body.decks === "string") {
                decks.push(req.body.decks);
            } else if (typeof req.body.decks !== 'undefined' && req.body.decks != null) {
                decks = req.body.decks
            } else {
                res.status(400).send({message: "Vous n'avez sélectionné aucun deck."});
                return;
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

    app.post('/decks/removeCard', (req, res) => {
        logger.route("POST /decks/removeCard");
        if (typeof req.decoded === 'undefined' || req.decoded == null) {
            res.status(401).send({error: 'Vous devez être connecté pour réaliser cette action.'});
            return;
        }
        if (typeof req.body === 'undefined' || req.body == null) {
            res.status(400).send({error: 'Aucun paramètre fourni.'});
            return;
        }

        deck_modify.removeCardFromDeck(req.body.deckId, req.body.cardId, req.body.deckPart, req.decoded.username, (err, data) => {
            if (typeof err === 'undefined' || err == null) {
                res.status(200).send({message: data});
            } else {
                res.status(400).send({error: err});
            }
        });
    })

    app.post('/decks/updateCardCount', (req, res) => {
        logger.route("POST /decks/updateCardCount");
        if (typeof req.decoded === 'undefined' || req.decoded == null) {
            res.status(401).send({error: 'Vous devez être connecté pour réaliser cette action.'});
            return;
        }
        if (typeof req.body === 'undefined' || req.body == null) {
            res.status(400).send({error: 'Aucun paramètre fourni.'});
            return;
        }

        deck_modify.modifyCardCount(req.body.deckId, req.body.cardId, req.body.deckPart, req.body.count, req.decoded.username, (err, data) => {
            if (typeof err === 'undefined' || err == null) {
                res.status(200).send({message: data});
            } else {
                res.status(400).send({error: err});
            }
        });
    })
}
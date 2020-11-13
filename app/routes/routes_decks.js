var deck_create = require.main.require('./app/controllers/decks/create');
var deck_get = require.main.require('./app/controllers/decks/get')
var formats = require.main.require('./app/models/enums/formats');
var states = require.main.require('./app/models/enums/states');
var logger = require.main.require('./app/loader/logger');

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
            res.render('partials/decks/detail', { formats: formats, states: states, deck: deck });
        });
    })

    app.get('/user/decks', (req, res) => {
        logger.route("GET /user/decks");
        if (typeof req.decoded !== 'undefined' && req.decoded != null) {
            deck_get.getDecksOfUser(req.decoded.username, (err, decks) => {
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
}
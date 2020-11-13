var logger = require.main.require('./app/loader/logger');
var login = require.main.require('./app/controllers/users/login')
var signup = require.main.require('./app/controllers/users/signup')
var get = require.main.require('./app/controllers/users/get')
var logout = require.main.require('./app/controllers/users/logout')
var symbols = require.main.require('./app/controllers/symbols/get');
var cards = require.main.require('./app/controllers/cards/get');
var cards_collection = require.main.require('./app/controllers/cards/update_collection');
var sets = require.main.require('./app/controllers/sets/get');

module.exports = function(app, baseDir) {
    app.get('/user/signin', (req, res) => {
        logger.route("GET /user/login");
        res.render('partials/users/signin');
    })

    app.post('/user/signin', (req, res) => {
        logger.route("POST /user/login");
        login(req, res);
    })

    app.get('/user/signup', (req, res) => {
        logger.route("GET /user/signup");
        res.render('partials/users/signup');
    })

    app.post('/user/signup', (req, res) => {
        logger.route("POST /user/signup");
        signup(req, res);
    })

    app.get('/user/logout', (req, res) => {
        logger.route("GET /user/logout");
        logout(req, res);
    })

    app.get('/user/info', (req, res) => {
        logger.route("GET /user/info");
        get(req, res, (user) => {
            res.render('partials/users/info', { pseudo: user.pseudo, avatar: user.avatar });
        });
    })

    app.post('/user/cards/update', (req, res) => {
        logger.route("POST /user/cards/update");
        cards_collection.updateCollection(req.body, req.decoded['username'], result => {
            res.status(200).send({
                message: "Les mises à jour ont bien été prises en compte"
            });
        });
    });

    app.get('/user/cards', (req, res) => {
        logger.route("GET /user/cards");
        if (JSON.stringify(req.query) === JSON.stringify({})) {
            sets.getSets(sets => {
                res.render('partials/users/card_list', {
                    title: "Ma collection",
                    cards: [],
                    symbols: [],
                    sets: sets,
                    isCollection: true 
                });
            })
        } else {
            symbols.getAll(symbols => {
                cards.advanced_search(req.query, cards => {
                    sets.getSets(sets => {
                        cardsIds = cards.map(card => card._id);
                        userId = req.decoded['username']
                        cards_collection.getCollectionCountsFromIds(cardsIds, userId, colectionCounts => {
                            res.render('partials/users/card_list', {
                                title: "Ma collection",
                                cards: cards,
                                symbols: symbols,
                                sets: sets,
                                isCollection: true,
                                collectionCounts: JSON.parse(JSON.stringify(colectionCounts))
                            });
                        })
                    });
                });
            });
        }
    });
}
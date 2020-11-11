// var choseGame = require.main.require('./app/controllers/decks');
var logger = require.main.require('./app/loader/logger');

module.exports = function(app, baseDir) {
    app.get('/decks', (req, res) => {
        logger.route("GET /decks");
        res.render('partials/decks/list');
    })

    app.get('/decks/detail', (req, res) => {
        logger.route("GET /decks/detail");
        res.render('partials/decks/detail');
    })

    app.get('/user/decks', (req, res) => {
        logger.route("GET /user/decks");
        res.render('partials/decks/user');
    })
}
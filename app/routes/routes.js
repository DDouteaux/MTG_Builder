var logger = require.main.require('./app/loader/logger');

module.exports = function(app, baseDir) {
    app.get('/', (req, res) => {
        logger.route("GET /");
        res.render('index');
    })

    app.get('/help/plan', (req, res) => {
        logger.route("GET /help/plan");
        res.render("partials/help/plan_site");
    })

    app.get('/help/', (req, res) => {
        logger.route("GET /help/");
        res.render("partials/help/main");
    })

    app.get('/*', (req, res) => {
        logger.route("* Default redirect");
        res.redirect('/?error=La page demandée n\'existe pas.');
    })
}
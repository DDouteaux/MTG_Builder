var logger = require.main.require('./app/loader/logger');

module.exports = function(app, baseDir) {
    app.get('/', (req, res) => {
        logger.route("GET /");
        res.render('index');
    })

    app.get('/*', (req, res) => {
        logger.route("* Default redirect");
        res.redirect('/?error=La page demandée n\'existe pas.');
    })
}
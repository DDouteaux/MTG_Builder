let jwt = require('jsonwebtoken');
let messages = require.main.require('./app/config/messages');
var logger = require.main.require('./app/loader/logger');

let checkToken = (req, res, next) => {
    logger.debug("Méthode controllers/users/check/checkToken");
    tokenError = null;
    req.app.locals.decoded = false;
    urlPath = req._parsedUrl.pathname

    if (['/user/signin', '/user/signup', '/'].includes(urlPath)
                || (!urlPath.startsWith('/user') && !urlPath.startsWith('/settings'))) {
        logger.debug("[ " + urlPath + " ] Cette page n'est pas protégée");
        if (req.cookies["token"] != undefined) {
            logger.debug("Présence du cookie");
            jwt.verify(req.cookies["token"], process.env.JWTHASH, (err, decoded) => {
                if (!err) {
                    req.decoded = decoded;
                    req.app.locals.decoded = decoded;
                }
                next();
            })
        } else {
            logger.debug("Pas de cookie");
            next();
        };
    } else if (req.cookies["token"] != undefined) {
        logger.debug("Cett page est protégée");
        // Normal page, you should have a token
        jwt.verify(req.cookies["token"], process.env.JWTHASH, (err, decoded) => {
            if (err) {
                if (err.name == "TokenExpiredError") {
                    logger.debug("   > Le token est expiré");
                    tokenError = messages.token.expired;
                } else {
                    logger.debug("   > Le token est invalide");
                    tokenError = messages.token.invalid;
                }
            } else {
                req.decoded = decoded;
                req.app.locals.decoded = decoded;
                next();
            }
        });
    } else {
        // Normal page and no token, return to login
        logger.debug("   > Le token n'est pas fourni");
        tokenError = messages.token.missing;
    }
    
    if (tokenError != null) {
        res.redirect('/?error=' + encodeURIComponent(tokenError));
    }
};

module.exports = checkToken
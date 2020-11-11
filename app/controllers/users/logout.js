var User = require.main.require('./app/models/user/user');
let jwt = require('jsonwebtoken');
let messages = require.main.require('./app/config/messages');
var logger = require.main.require('./app/loader/logger');

function logout (req, res) {
    logger.debug("Méthode controllers/users/logout/logout");
    let message = messages.logout.noToken;

    if(req.cookies["token"] != undefined) {
        // Normal page, you should have a token
        jwt.verify(req.cookies["token"], process.env.JWTHASH, (err, decoded) => {
            message = messages.logout.success
        })
    }

    res.clearCookie("token");
    res.status(302).location('/?info=' + message).end();
}

module.exports = logout
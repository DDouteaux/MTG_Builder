var User = require.main.require('./app/models/user/user');
let jwt = require('jsonwebtoken');
let md5 = require('md5');
var logger = require.main.require('./app/loader/logger');

function login (req, res) {
    logger.debug("Méthode controllers/users/login/login");
    let pseudo = req.body.pseudo;
    let pwd = req.body.pwd;
    let error = "";

    if (!pseudo) {
        logger.debug("   > Pas de pseudo fourni");
        error = "Veuillez saisir un pseudo.";
    }
    if (!pwd) {
        logger.debug("   > Pas de mot de passe fourni");
        error = "Veuillez saisir un mot de passe.";
    }
    if (error) {
        res.clearCookie("token");
        res.redirect("/user/signin?error=" + error.trim());
        return;
    }

    let username = md5(pseudo.toLowerCase());
    let pwdHash = md5(pwd);
    User.connect(username, pwdHash, (err, data) => {
        if(err) {
            res.redirect("/user/signin?error=" + err);
            return;
        }
        if (data === null) {
            res.redirect("/user/signin?error=Échec de la connexion");
            return;
        }
        authenticateUser(data, req, res);
    });
}

function authenticateUser(data, req, res) {
    logger.debug("Méthode controllers/users/login/authenticateUser");
    let token = jwt.sign({
            username: md5(data.pseudo.toLowerCase()),
            pseudo: data.pseudo,
            avatar: data.avatar
        },
        process.env.JWTHASH,
        {
            expiresIn: '12h'
        }
    );
    res.clearCookie("token");
    res.cookie('token', token);
    res.status(302).location('/user/decks').end();
}

module.exports = login
var User = require.main.require('./app/models/user/user');
var logger = require.main.require('./app/loader/logger');
var md5 = require('md5');

function signup (req, res) {
    logger.debug("Méthode controllers/users/login/signup");
    let pseudo = req.body.pseudo;
    let avatar = req.body.avatar;
    let pwd = req.body.pwd;
    let pwdConfirm = req.body.pwdConfirm;
    let error = "";

    if (!pseudo) {
        logger.debug("   > Pas de pseudo fourni");
        error = "Veuillez saisir un pseudo.";
    }
    if (!avatar) {
        logger.debug("   > Pas d'avatar sélectionné");
        error += " Veuillez choisir un avatar."
    }
    if (!pwd) {
        logger.debug("   > Pas de mot de passe fourni");
        error += " Veuillez saisir un mot de passe."
    }
    if (!pwdConfirm) {
        logger.debug("   > Pas de confirmation du mot de passe");
        error += " Veuillez confirmer votre mot de passe."
    }
    if (pwd !== pwdConfirm) {
        logger.debug("   > Le mot de passe et sa confirmation ne correspondent pas");
        error += " Votre mot de passe et sa confirmation sont différents."
    }
    if (error) {
        res.clearCookie("token");
        res.redirect("/user/signup?error=" + error.trim());
        return;
    }

    let username = md5(pseudo.toLowerCase());
    let pwdHash = md5(pwd);
    avatar = avatar.replace("_", " ");
    User.create(username, pseudo, avatar, pwdHash, (err, data) => {
        if(err) {
            res.redirect("/user/signup?error=" + err);
            return;
        }
        res.clearCookie("token");
        res.status(302).location('/user/signin').end();
    });
}

module.exports = signup
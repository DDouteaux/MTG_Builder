// Main dependencies
const express = require('express');
const http = require('http');
const app = express();
const server = http.createServer(app);
const io = require('socket.io').listen(server);
const logger = require.main.require('./app/loader/logger');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser')
const favicon = require('serve-favicon');
const compression = require('compression')
const handlebars = require('express-handlebars');
const checkToken = require('./app/controllers/users/check');

// Init logs
logger.initLogs()

// Loading configuration
var config = require('./app/config/config');

// Setting up application
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.use(express.static(__dirname + "/site"));
app.use(express.static(__dirname + "/app"));
app.use(express.static(__dirname));
app.use(favicon(__dirname + '/site/images/favicon.jpg'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(compression());
app.use(checkToken);
app.set('view engine', 'hbs');
app.set('views', __dirname + '/site/views')
app.engine('hbs', handlebars({
    layoutsDir: __dirname + '/site/views/layouts',
    partialsDir: __dirname + '/site/views/partials',
    extname: 'hbs',
    defaultLayout: 'default',
    helpers: {
        replaceSymbolsWithWidth: (text, symbols, width) => {
            if (typeof width == 'undefined' || text == width) {
                return 15;
            }
            if (typeof text == 'undefined' || text == null) {
                return "";
            }
            if (typeof symbols == 'undefined' || symbols == null) {
                return text;
            }
            parenthesis = text.match(/\([^\)]*\)/g);
            matches = text.match(/\{[^\}]*\}/g);
            
            if (parenthesis) {
                parenthesis.forEach((match) => {
                    text = text.replace(match, "<i>" + match + "</i>");
                });
            }

            if (matches) {
                matches.forEach((match) => {
                    if (symbols[match]) {
                        text = text.replace(match, "<img src='/images/symbols/" + symbols[match] + "' width='" + width + "'></img>");
                    }
                });
            }
            return text;
        },

        replaceSymbols: (text, symbols) => {
            if (typeof text == 'undefined' || text == null) {
                return "";
            }
            if (typeof symbols == 'undefined' || symbols == null) {
                return text;
            }
            parenthesis = text.match(/\([^\)]*\)/g);
            matches = text.match(/\{[^\}]*\}/g);
            
            if (parenthesis) {
                parenthesis.forEach((match) => {
                    text = text.replace(match, "<i>" + match + "</i>");
                });
            }

            if (matches) {
                matches.forEach((match) => {
                    if (symbols[match]) {
                        text = text.replace(match, "<img src='/images/symbols/" + symbols[match] + "' width='15'></img>");
                    }
                });
            }
            return text;
        },

        validityStyle: (validity, format) => {
            switch(validity) {
                case "legal":
                    return '<div class="badge badge-success col-3">AUTORISÉE</div><div class="col-3">' + format.charAt(0).toUpperCase() + format.slice(1) + '</div>';
                case "not_legal":
                    return '';
                case "banned":
                    return '<div class="badge badge-danger col-3">BANNIE</div><div class="col-3">' + format.charAt(0).toUpperCase() + format.slice(1) + '</div>';
                case "restricted":
                    return '<div class="badge badge-warning col-3">RESTREINTE</div><div class="col-3">' + format.charAt(0).toUpperCase() + format.slice(1) + '</div>';
            }
        },

        displayColor: (colors, card_faces) => {
            if (typeof colors === 'undefined' || colors == null) {
                colors = [];
            }

            if (typeof card_faces != 'undefined' || card_faces != null) {
                card_faces.forEach(face => {
                    colors.concat(face.colors)
                });
            }

            uniqueColors = [...new Set(colors)];

            if (uniqueColors.length > 1) {
                return "Multicolore";
            } else if (uniqueColors.length === 1) {
                switch(uniqueColors[0]) {
                    case 'W':
                        return "Blanc";
                    case 'U':
                        return "Bleu";
                    case 'B':
                        return "Noir";
                    case 'R':
                        return "Rouge";
                    case 'G':
                        return "Vert";
                }
            } else {
                return 'Incolore';
            }
        },

        isFrontFace: (card_face) => {
            return card_face.side == 'front';
        },

        and: (op1, op2) => {
            return op1 && op2;
        },

        or: (op1, op2) => {
            return op1 || op2;
        },

        formatRarity: (rarity) => {
            if (rarity) {
                return rarity.charAt(0).toUpperCase() + rarity.slice(1);
            }
        },

        formatEffects: (effect) => {
            if (effect) {
                if (effect === "extendedart") {
                    effect = "extended art";
                }
                return effect.charAt(0).toUpperCase() + effect.slice(1);
            }
        },

        stringifyIt: (objet) => {
            return JSON.stringify(objet);
        },

        isFrench: (language) => {
            return language === "fr";
        },

        isFrenchVersion: (card) => {
            return card.inFrench;
        },

        getSetLogo: (setName, sets) => {
            setDetail = sets.filter(set => set.code === setName);
            if (typeof setDetail !== 'undefined' && setDetail != null && setDetail.length > 0) {
                return setDetail[0].icon;
            } else {
                return 'planeswalker.svg';
            }
        }
    }
}));

// Connect to DB
require('./app/loader/dbConnection');
es = require('./app/loader/esConnection');
es.init;

// Loading main routes
require('./app/routes/routes_decks')(app, __dirname);
require('./app/routes/routes_cards')(app, __dirname);
require('./app/routes/routes_sets')(app, __dirname);
require('./app/routes/routes_settings')(app, __dirname);
require('./app/routes/routes_users')(app, __dirname);
require('./app/routes/routes')(app, __dirname);

// Connect Socket IO
io.on('connection', (socket) => {});

// Setting io in global context for transverse use
app.set('io', io);

// Launch server
server.listen(
    config.server.port, 
    () => {
        logger.info('Server is running on port ' + server.address().port);
    }
);

process.on("SIGINT", function () {
    process.exit();
});

process.on('exit', () => {
    logger.info('Extinction du serveur.');
});
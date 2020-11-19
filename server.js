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

// Usefull methods for Handlebars helpers
const cardTypes = require('./app/loader/cardTypes');

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

        eq: (op1, op2) => {
            return op1 === op2;
        },

        formatEquals: (key, value, formats) => {
            return formats[key] === value;
        },

        storeKey: (value) =>{
            this.key = value;
        },

        formatRarity: (rarity) => {
            if (rarity) {
                withUpperCase = rarity.charAt(0).toUpperCase() + rarity.slice(1);
                switch(withUpperCase) {
                    case "Uncommon":
                        return "Unco";
                    default:
                        return withUpperCase;
                }
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
            if (typeof sets != 'undefined' && sets != null ) {
                setDetail = sets.filter(set => set.code === setName);
                if (typeof setDetail !== 'undefined' && setDetail != null && setDetail.length > 0) {
                    return setDetail[0].icon;
                } 
            }
            return 'planeswalker.svg';
        },

        displayDate: (datetime) => {
            date = new Date(datetime);
            return date.getDate() + "/" + (date.getMonth()+1) + "/" + date.getFullYear();
        },

        getDeckParts: (cards, part) => {
            if (['SIDEBOARD', 'COMPANION', 'COMMANDER', 'TOBUY', 'MAYBEBOARD', 'RETIRED'].indexOf(part) > -1) {
                return cards.filter(card => card.deckPart === part);
            } else {
                return cards.filter(card => {
                    if (card.card_faces && card.card_faces[0].side) {
                        face = card.card_faces[0];
                    } else {
                        face = card;
                    }

                    if (part == 'Planeswalker') {
                        return cardTypes.isPlaneswalkerMainDeck(card, face);
                    } else if (part == 'Creature') {
                        return cardTypes.isCreatureMainDeck(card, face);
                    } else if (part == 'Instant') {
                        return cardTypes.isInstantMainDeck(card, face);
                    } else if (part == 'Sorcery') {
                        return cardTypes.isSorceryMainDeck(card, face);
                    } else if (part == 'Enchantment') {
                        return cardTypes.isEnchantmentMainDeck(card, face);
                    } else if (part == 'Artifact') {
                        return cardTypes.isArtifactMainDeck(card, face);
                    } else if (part == 'Land') {
                        return cardTypes.isLandMainDeck(card, face);
                    }
                });
            }
        },

        cardNameInDeck: (cardName) => {
            if (typeof cardName != 'undefined' && cardName != null) {
                if (cardName.match(/(.*) \/\//) != null) {
                    return cardName.match(/(.*) \/\//)[1];
                } else {
                    return cardName;
                }
            }
        },

        getLabelOfUser: (userId, users) => {
            if (typeof userId === "undefined" || userId == null 
                || typeof users === "undefined" || users == null) {
                    return userId;
            } else {
                return users.filter(user => user.userId === userId)[0].pseudo;
            }
        },

        getHistogramFromCards: (cards) => {
            cmcHist = [];
            cards.forEach(card => {
                if (card.card_faces) {
                    face = card.card_faces[0]
                } else {
                    face = card;
                }

                if (face.type_line.indexOf('Land') == -1 || face.type_line.indexOf('Creature') > -1) {
                    card_cmc = face.cmc;
                    card_count = card.count;
                    cmcHist.push({cmc: card_cmc, count: card_count, id: card.id})
                }
            });
            return cmcHist;
        },

        getHistogramCardTypes: (cards) => {
            cardTypesHist = [];
            cards.forEach(card => {
                if (card.card_faces) {
                    face = card.card_faces[0]
                } else {
                    face = card;
                }

                if (cardTypes.isPlaneswalker(card, face)) {
                    cardTypesHist.push({cardType: 'Planeswalker', count: card.count, id: card.id});
                } else if (cardTypes.isCreature(card, face)) {
                    cardTypesHist.push({cardType: 'Créature', count: card.count, id: card.id});
                } else if (cardTypes.isInstant(card, face)) {
                    cardTypesHist.push({cardType: 'Éphémère', count: card.count, id: card.id});
                } else if (cardTypes.isSorcery(card, face)) {
                    cardTypesHist.push({cardType: 'Rituel', count: card.count, id: card.id});
                } else if (cardTypes.isEnchantment(card, face)) {
                    cardTypesHist.push({cardType: 'Enchantement', count: card.count, id: card.id});
                } else if (cardTypes.isArtifact(card, face)) {
                    cardTypesHist.push({cardType: 'Artefact', count: card.count, id: card.id});
                } else if (cardTypes.isLand(card, face)) {
                    cardTypesHist.push({cardType: 'Terrain', count: card.count, id: card.id});
                }
            });
            return cardTypesHist;
        },

        getHistogramCardSubTypes: (cards) => {
            cardSubTypesHist = [];
            cards.forEach(card => {
                if (card.card_faces) {
                    face = card.card_faces[0]
                } else {
                    face = card;
                }

                if (!face.type_line.includes("Land")) {
                    subTypes = face.type_line.split('—')[1];
                    if (subTypes != null) {
                        subTypes.trim().split(' ').map(subType => {
                            subTypeToUpdate = cardSubTypesHist.filter(c => c.cardSubType === subType);
                            if (subTypeToUpdate.length > 0) {
                                subTypeToUpdate[0].count += card.count;
                                subTypeToUpdate[0].ids.push(card.id)
                            } else {
                                cardSubTypesHist.push({
                                    cardSubType: subType,
                                    count: card.count,
                                    ids: [card.id]
                                });
                            }
                        });
                    }
                }
            });
            return cardSubTypesHist;
        },

        indexedCardCount(setCode, set_counts) {
            for(set_count_key in Object.keys(set_counts)) {
                set_count = set_counts[set_count_key];
                if (set_count.set === setCode) {
                    return set_count.count;
                }
            }
        },

        computeIsInCollection(cardId, counts) {
            if (typeof counts === 'undefined' || counts == null || counts.length == 0) {
                return "Non";
            }

            if (typeof cardId === 'undefined' || cardId == null || cardId.length == 0) {
                return "Non";
            }

            matching_counts = counts.filter(count => count.cardId === cardId && (count.foil > 0 || count.normal > 0));

            if (matching_counts.length > 0) {
                return "Oui";
            } else {
                return "Non";
            }
        },

        isInPrincipalSet(card, set) {
            cardCollectorNumber = card.collector_number
            if (typeof set === "undefined" || set == null 
                    || typeof set.printed_size === "undefined" || set.printed_size == null
                    || typeof cardCollectorNumber === "undefined" || cardCollectorNumber == null) {
                return (!card.frame_effects.includes("showcase")
                            && !card.frame_effects.includes("extendedart")
                            && (typeof card.promo_types === "undefined" || card.promo_types.length == 0));
            }

            cardCollectorNumber = cardCollectorNumber.match(/[0-9]+/)[0]

            return typeof cardCollectorNumber !== 'undefined' && cardCollectorNumber != null 
                    && cardCollectorNumber <= set.printed_size;
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
var logger = require.main.require('./app/loader/logger');
var es = require.main.require('./app/loader/esConnection');
var config = require.main.require('./app/config/config');
var EsResult = require.main.require('./app/models/es_results');
var Card = require.main.require('./app/models/cards/card');
var Set = require.main.require('./app/models/set');
const fs = require('fs');
const https = require('https');
const axios = require('axios')
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var crypto = require('crypto');

function getSetImages(setCode, callback) {
    logger.debug("Méthode models/settings/updates/getSetImages");
    logger.info("[ " + setCode + " ] Chargement des images");
    dirCardPath = 'site/images/cards/' + setCode + "/";
    fs.mkdir(dirCardPath, { recursive: true }, (err) => {
        if (err) {
            logger.error('Impossible de créer le répertoire pour les cartes de ' + setCode);
            logger.error(err);
        }
    });
}

function addOrUpdateSet(setCode, loadImages, callback) {
    logger.debug("Méthode models/settings/updates/addOrUpdateSet");
    logger.info("[ " + setCode + " ] Chargement du set");
    dirCardPath = 'site/images/cards/' + setCode + "/";
    fs.mkdir(dirCardPath, { recursive: true }, (err) => {
        if (err) {
            logger.error('Impossible de créer le répertoire pour les cartes de ' + setCode);
            logger.error(err);
        }
    });

    return new Promise(function(resolve, reject) {
        searchIfSetExistsInES(setCode, (uri) => {
            getAllCardsFromSet(setCode, uri, [], async (cards) => {
                cards = await enrichAllCards(cards, loadImages);
                logger.info("[ " + setCode + " ] Fin d'enrichissement : " + cards.length);
                resolve(await indexCards(setCode, cards, callback));
            });
        });
    })
}

function searchIfSetExistsInES(setCode, callback) {
    logger.debug("Méthode models/settings/updates/searchIfSetExistsInES");
    logger.info("[ " + setCode + " ] Recherche du set dans Elasticsearch : " + setCode);
    es.client.search({
        index: 'sets',
        body: {
          query: {
            term: {
                code: {
                    value: setCode
                }
            }
          }
        },
      }, function (error, res) {
        if (res.hits.hits.length === 1) {
            callback(res.hits.hits[0]._source.scryfall_scroll);
        } else if (res.hits.hits.length === 0) {
            logger.error("Aucune édition correspond à ce code n'a été trouvée.");
        } else {
            logger.error("Plusieurs éditions correspondent à ce code.");
        }
      });
}

async function getAllCardsFromSet(setCode, set_uri, cards, callback) {
    logger.debug("Méthode models/settings/updates/getAllCardsFromSet");
    logger.info("[ " + setCode + " ] Recherche des cartes du set (déjà trouvées : " + cards.length + ")");
    res = await axios.get(set_uri);
    cards = cards.concat(res.data.data);
    if (res.data.has_more) {
        getAllCardsFromSet(setCode, res.data.next_page, cards, callback);
    } else {
        callback(cards);
    }
}

async function enrichAllCards(cards, loadImages, callback) {
    logger.debug("Méthode models/settings/updates/enrichAllCards");
    logger.info("[ " + cards[0].set + " ] Nombre de cartes a enrichir : " + cards.length);
    var totalNumberOfCards = cards.length;
    var numberOfEnrichedCards = 0;
    esCards = [];
    cardsBuffer = []

    return new Promise(async function(resolve, reject) {
        for (const card of cards) {
            cardObj = new Card(card);
            cardsBuffer.push(cardObj);

            if (cardsBuffer.length > 0 && cardsBuffer.length % 200 === 0) {
                logger.info("[ " + cards[0].set + " ] Buffer de 200 cartes");
                esCards = esCards.concat(await enrichCardBuffer(cardsBuffer, loadImages));
                cardsBuffer = []
                logger.info("[ " + cards[0].set + " ] Attente après traitement du buffer (2s)")
                await new Promise(r => setTimeout(r, 5000));
                logger.info("[ " + cards[0].set + " ] Attente terminée")
            }
        }
        if (cardsBuffer.length > 0) {
            logger.info("[ " + cards[0].set + " ] Buffer de " + cardsBuffer.length + " cartes");
            try {
                esCards = esCards.concat(await enrichCardBuffer(cardsBuffer, loadImages));
            } catch(err) {
                logger.warn('Erreur lors du traitement des cartes de ' + cards[0].set);
            }
        }
        resolve(esCards);
    });
}

function enrichCardBuffer(cards, loadImages) {
    esCards = [];
    return new Promise(function(resolve, reject) {
        cards.forEach(cardObj => {
            storeCardImage(cardObj, loadImages, (cardObj) => {
                getCardRulings(cardObj, (cardObj) => {
                    getFrenchDetails(cardObj, (cardObj) => {
                        esCards.push(cardObj);
                        if (esCards.length === cards.length) {
                            resolve(esCards);
                        }
                    })
                })
            })
        })
    });
}

function storeCardImage(card, loadImages, callback) {
    if (loadImages) {
        if (typeof card.image_uris != 'undefined') {
            storeImage(card, dirCardPath + card._id.replace(/[\*\."\/\\\[\]:;|,]/gi, "_") + ".jpg");
        } else if (typeof card.card_faces != 'undefined') {
            card.card_faces.forEach(face => {
                storeImage(face, dirCardPath + card._id.replace(/[\*\."\/\\\[\]:;|,]/gi, "_") + "_" + face.side + ".jpg");
            })
        }
    }
    callback(card);
}

async function storeImage(card, cardImagePath) {
    if (!fs.existsSync(cardImagePath)) {
        await axios({
            method: "get",
            timeout: 5000,
            url: card.image_uris.normal,
            responseType: "stream"
        }).then(function (response) {
            response.data.pipe(fs.createWriteStream(cardImagePath));
        }).catch(function (err) {
            logger.error("[ " + card.set + " ] Erreur lors de l'enregistrement de l'image " + card.image_uris.normal + " dans le fichier " + cardImagePath);
            fs.unlink(cardImagePath)
        });
    }
}

async function getCardRulings(card, callback) {
    if (card.rulings_uri && card.rulings_uri !== "") {
        wholeResponse = "";
        res = await axios.get(card.rulings_uri)
        finalRulings = []
        try {
            rulings = res.data.data
            rulings.forEach(ruling => {
                finalRulings.push({
                    published_at: ruling.published_at,
                    comment: ruling.comment
                })
            })
            card.rulings = finalRulings;
            callback(card);
        } catch(err) {
            console.log(card.rulings_uri);
            console.log(wholeResponse.join(''));
        }
    } else {
        callback(card);
    }
}

async function getFrenchDetails(card, callback) {
    frenchDetailUri = "https://api.scryfall.com/cards/" + card.set + "/" + card.collector_number + "/fr";
    try {
        res = await axios.get(frenchDetailUri);
        if (res.data.card_faces) {
            frontFrench = res.data.card_faces.filter(face => face.image_uris.normal.indexOf('/front/') > 0)[0];
            backFrench = res.data.card_faces.filter(face => face.image_uris.normal.indexOf('/front/') === -1)[0];
            frontEnglish = card.card_faces.filter(face => face.side === "front")[0];
            backEnglish = card.card_faces.filter(face => face.side != "front")[0];

            frontEnglish.frenchDetails = {
                text: frontFrench.printed_text.replace(/\n/g, '<br>'),
                name: frontFrench.printed_name,
                type_line: frontFrench.printed_type_line,
                flavor_text: frontFrench.flavor_text.replace(/\n/g, '<br>'),
            }

            backEnglish.frenchDetails = {
                text: backFrench.printed_text.replace(/\n/g, '<br>'),
                name: backFrench.printed_name,
                type_line: backFrench.printed_type_line,
                flavor_text: backFrench.flavor_text.replace(/\n/g, '<br>'),
            }

            card.card_faces = [frontEnglish, backEnglish];
            card.inFrench = true;
        } else {
            card.frenchDetails = { 
                text: res.data.printed_text.replace(/\n/g, '<br>'),
                name: res.data.printed_name,
                type_line: res.data.printed_type_line,
                flavor_text: res.data.flavor_text.replace(/\n/g, '<br>')
            };
            card.inFrench = true;
        }
    } catch (err) {
        card.frenchDetails = null;
    }
    callback(card);
}

async function indexCards(setCode, cards, callback) {
    const body = cards.flatMap(doc => [{ index: { _index: 'cards', _id: doc._id } }, doc.getRepresentationForIndexing()])
    const bulkResponse = await es.client.bulk({ refresh: true, body })
    if (bulkResponse.errors) {
        logger.error("[ " + setCode + " ] Erreur lors de l'indexation des cartes.");
        logger.error(bulkResponse.errors);
    }
    numberErrors = bulkResponse.items.filter(value => value.index.result === 'error').length;
    numberAdded = bulkResponse.items.filter(value => value.index.result === 'created').length;
    numberUpdated = bulkResponse.items.filter(value => value.index.result === 'updated').length;
    logger.info("[ " + setCode + " ] Fin de l'indexation");
    return new EsResult(setCode, numberAdded, numberUpdated, numberErrors);
}

function getAllPhysicalSetsFromScryfall(callback) {
    logger.debug("Méthode models/settings/updates/getAllPhysicalSetsFromScryfall");

    // Contact à l'API Scryfall pour récupérer la liste des éditions
    https.get(config.api.scryfallSets, response => {
        callback(xmlHttp.responseText);
    })
}

function updateDisplayableSetsList(callback) {
    logger.debug("Méthode models/settings/updates/updateDisplayableSetsList");
    getAllPhysicalSetsFromScryfall((data) => {
        sets = []

        data = JSON.parse(data)
        data.data.forEach(element => {
            if (element.digital) {
                return;
            }
            icon_name = element.icon_svg_uri.substring(element.icon_svg_uri.lastIndexOf('/') + 1).split('?')[0]
            set = new Set(element);

            es.client.index({  
                index: 'sets',
                id: element.id,
                body: set
            }, (err, resp, status) => {
                if (err) {
                    logger.error("Erreur lors de l'indexation de " + element.name);
                } else {
                    logger.info("Indexation de l'édition " + element.name + " réalisée avec succès");
                }
            });

            try {
                if (!fs.existsSync('site/images/sets/' + icon_name)) {
                    const file = fs.createWriteStream('site/images/sets/' + icon_name);
                    const request = https.get(element.icon_svg_uri, function(response) {
                        response.pipe(file);
                    });
                }
            } catch (err) {
                logger.error(err);
            }

            sets.push(set);
        })
        callback(sets);
    })
}

function getSymbols(callback) {
    logger.debug("Méthode models/settings/updates/getSymbols");
        // Contact à l'API Scryfall pour récupérer les symboles
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function() { 
            if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
                data = JSON.parse(xmlHttp.responseText);
                data.data.forEach(asyncelement => {
                    var hash = crypto.createHash('md5').update(element.symbol).digest('hex');
                    symbolFileName = element.svg_uri.substring(element.svg_uri.lastIndexOf('/') + 1)
                    element.symbolFileName = symbolFileName;
                    
                    es.client.index({  
                        index: 'symbols',
                        id: hash,
                        body: {id, ...toIndex} = element
                    }, (err, resp, status) => {
                        if (err) {
                            logger.error("Erreur lors de l'indexation de " + element.name);
                        } else {
                            logger.info("Indexation du symbole " + element.symbol + " réalisée avec succès");
                        }
                    });
        
                    try {
                        if (!fs.existsSync('site/images/symbols/' + element.symbolFileName)) {
                            const file = fs.createWriteStream('site/images/symbols/' + element.symbolFileName);
                            const request = https.get(element.svg_uri, function(response) {
                                response.pipe(file);
                            });
                        }
                    } catch (err) {
                        logger.error(err);
                    }
                });
                callback();
            }
        }
        xmlHttp.open("GET", config.api.scryfallSymbols, true);
        xmlHttp.send(null);
}

module.exports = { updateSetsList: updateDisplayableSetsList,
                   addOrUpdateSet: addOrUpdateSet,
                   getSymbols: getSymbols,
                   getSetImages: getSetImages };
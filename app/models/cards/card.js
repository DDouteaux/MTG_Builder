var logger = require.main.require('./app/loader/logger');

class Card {
    constructor(card) {
        for (var key in card){
            this[key] = card[key];
        }
        this._id = card.set + '-' + card.collector_number;
        this.type = this.computeType(this.type_line);
        this.subType = this.computeSubType(this.type_line);

        if (typeof card.frame_effects === 'undefined') {
            this.frame_effects = ['none']
        } else if (card.frame_effects != null && card.frame_effects === ['legendary']) {
            this.frame_effects.push('none');
        }

        if (this.color_identity.length === 0) {
            this.color_identity = ['C'];
        }

        if (typeof this.oracle_text != 'undefined' && this.oracle_text != null) {
            this.oracle_text = this.oracle_text.replace(/\n/g, '<br>');
        }
        
        if (typeof this.card_faces != 'undefined' && this.card_faces != null) {
            this.card_faces.forEach(face => {
                if (typeof face.image_uris != 'undefined' && face.image_uris != null) {
                    if (face.image_uris.small.includes('/back/')) {
                        face.side = 'back';
                    } else {
                        face.side = 'front';
                    }
                }

                if (typeof face.oracle_text != 'undefined' && face.oracle_text != null) {
                    face.oracle_text = face.oracle_text.replace(/\n/g, '<br>');
                }

                if (typeof face.flavor_text != 'undefined' && face.flavor_text != null) {
                    face.flavor_text = face.flavor_text.replace(/\n/g, '<br>');
                }

                if (typeof face.mana_cost != 'undefined' && face.mana_cost != null) {
                    var cmc = 0;
                    [...face.mana_cost.matchAll(/\{([^\}]*)\}/gi)].map(m => m[1]).forEach(cost => {
                        if (cost === 'X') {
                            cmc += 0;
                        } else if (!isNaN(parseInt(cost))) {
                            cmc += parseInt(cost);
                        } else if (cost.includes('2/')) {
                            cmc += 2;
                        } else if (['U', 'B', 'G', 'W', 'R'].includes(cost)) {
                            cmc += 1;
                        } else if (cost.match(/[UBGWR]\/[UBGWR]/)) {
                            cmc += 1;
                        } else {
                            cmc += 1;
                            logger.warn('Pas de conversion de CMC explicite pour ' + cost);
                        }
                    })
                    face.cmc = cmc;
                }
            })
        }

        if (typeof this.flavor_text != 'undefined' && this.flavor_text != null) {
            this.flavor_text = this.flavor_text.replace(/\n/g, '<br>');
        }
    }

    getRepresentationForIndexing() {
        const { _id, ...representation } = this
        return representation;
    }

    computeType(typeLine) {
        if (typeLine.indexOf('//') > -1) {
            var types = []
            typeLine.split('//').forEach(subpartTypeLine => {
                types.concat(this.computeType(subpartTypeLine));
            });
            return [...new Set(types)]
        } else {
            try {
                return typeLine.match(/^([^—:]+)\s+(—|:)/)[1].split(' ');
            } catch(error) {
                return typeLine.split(' ');
            }
        }
    }

    computeSubType(typeLine) {
        if (typeLine.indexOf('//') > -1) {
            var subTypes = []
            typeLine.split('//').forEach(subpartTypeLine => {
                subTypes.concat(this.computeSubType(subpartTypeLine));
            });
            return [...new Set(subTypes)]
        } else {
            try {
                return typeLine.match(/^([^—:]+)\s+(—|:)\s+(.*)/)[3].split(' ');
            } catch(error) {
                return [];
            }
        }
    }
}

module.exports = Card
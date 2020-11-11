function replaceSymbolsWithWidth (text, symbols, width) {
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
}

function replaceSymbols (text, symbols) {
    return this.helpers.replaceSymbolsWithWidth(text, symbols, 15);
}

function validityStyle (validity, format) {
    switch(validity) {
        case "legal":
            return '<div class="badge badge-success col-3">AUTORISÉE</div><div class="col-3">' + format + '</div>';
        case "not_legal":
            return '';
        case "banned":
            return '<div class="badge badge-danger col-3">BANNIE</div><div class="col-3">' + format + '</div>';
        case "restricted":
            return '<div class="badge badge-warning col-3">RESTREINTE</div><div class="col-3">' + format + '</div>';
    }
}

function isFrontFace (card_face) {
    return card_face.side == 'front';
}

function and (op1, op2) {
    return op1 && op2;
}

function formatRarity (rarity) {
    if (rarity) {
        return rarity.charAt(0).toUpperCase() + rarity.slice(1);
    }
}

function formatEffects (effect) {
    if (effect) {
        if (effect === "extendedart") {
            effect = "extended art";
        }
        return effect.charAt(0).toUpperCase() + effect.slice(1);
    }
}

function stringifyIt (objet) {
    return JSON.stringify(objet);
}

function isFrench (language) {
    return language === "fr";
}

function isFrenchVersion (card) {
    if (typeof card.card_faces != 'undefined') {
        console.log(card.card_faces[0].frenchDetails);
        console.log(card.card_faces[1].frenchDetails);
    }
    return card.inFrench;
}

module.exports = { replaceSymbolsWithWidth: replaceSymbolsWithWidth,
                   replaceSymbols: replaceSymbols,
                   validityStyle: validityStyle,
                   isFrontFace: isFrontFace,
                   and: and,
                   formatRarity: formatRarity,
                   formatEffects: formatEffects,
                   stringifyIt: stringifyIt, 
                   isFrench: isFrench,
                   isFrenchVersion: isFrenchVersion }
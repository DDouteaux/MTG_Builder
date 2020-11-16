function isMain(card) {
    return card.deckPart === 'MAIN';
}

function isCreature(face) {
    return face.type_line.indexOf('Creature') >= 0 && face.type_line.indexOf('Land') < 0
}

function isPlaneswalker(face) {
    return face.type_line.indexOf('Planeswalker') >= 0;
}

function isInstant(face) {
    return face.type_line.indexOf('Instant') >= 0 && face.type_line.indexOf('Creature') < 0;
}

function isSorcery(face) {
    return face.type_line.indexOf('Sorcery') >= 0 && face.type_line.indexOf('Creature') < 0;
}

function isEnchantment(face) {
    return face.type_line.indexOf('Enchantment') >= 0 && face.type_line.indexOf('Creature') < 0;
}

function isArtifact(face) {
    return face.type_line.indexOf('Artifact') >= 0 && face.type_line.indexOf('Creature') < 0;
}

function isLand(face) {
    return face.type_line.indexOf('Land') >= 0 && face.type_line.indexOf('Creature') < 0 
            && face.type_line.indexOf('Instant') < 0 && face.type_line.indexOf('Sorcery') < 0;
}

function isCreatureMainDeck(card, face) {
    return isMain(card) && isCreature(face);
}

function isPlaneswalkerMainDeck(card, face) {
    return isMain(card) && isPlaneswalker(face);
}

function isInstantMainDeck(card, face) {
    return isMain(card) && isInstant(face);
}

function isSorceryMainDeck(card, face) {
    return isMain(card) && isSorcery(face);
}

function isEnchantmentMainDeck(card, face) {
    return isMain(card) && isEnchantment(face);
}

function isArtifactMainDeck(card, face) {
    return isMain(card) && isArtifact(face);
}

function isLandMainDeck(card, face) {
    return isMain(card) && isLand(face);
}

module.exports = {
    isMain:  isMain,
    isCreature: isCreature,
    isPlaneswalker: isPlaneswalker,
    isInstant: isInstant,
    isSorcery: isSorcery,
    isEnchantment: isEnchantment,
    isArtifact: isArtifact,
    isLand: isLand,
    isCreatureMainDeck: isCreatureMainDeck,
    isPlaneswalkerMainDeck: isPlaneswalkerMainDeck,
    isInstantMainDeck: isInstantMainDeck,
    isSorceryMainDeck: isSorceryMainDeck,
    isEnchantmentMainDeck: isEnchantmentMainDeck,
    isArtifactMainDeck: isArtifactMainDeck,
    isLandMainDeck: isLandMainDeck
}
class DeckCard {
    constructor(card) {
        this.id = card.id;
        this.count = card.count;
        this.status = card.status;
        this.deckPart = card.deckPart;
    }
}

module.exports = DeckCard
class Set {
    constructor(element, icon_name) {
        this.code = element.code;
        this.name = element.name;
        this.set_type = element.set_type;
        this.released_at = element.released_at;
        this.parent_set_code = element.parent_set_code;
        this.foil_only = element.foil_only;
        this.nonfoil_only = element.nonfoil_only;
        this.icon = icon_name;
        this.block = element.block;
        this.card_count = element.card_count;
        this.scryfall_scroll = element.search_uri;
        this.printed_size = element.printed_size;
    }
}

module.exports = Set
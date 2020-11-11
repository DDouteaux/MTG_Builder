module.exports = {
    server: {
        host: "0.0.0.0",
        port: 3000
    },
    db: {
        url: "127.0.0.1",
        port: "27017",
        table: "nivmizzet",
        user: "nivmizzethimself",
        pwd: "I\@mN1vM1zz€t"
    },
    log: {
        level: "info"
    },
    api: {
        scryfallSets: "https://api.scryfall.com/sets",
        scryfallSymbols: "https://api.scryfall.com/symbology"
    }
}

// db.createUser( { user: "nivmizzethimself", pwd: "I@mN1vM1zz€t", roles:  [ "readWrite", "dbAdmin" ]})
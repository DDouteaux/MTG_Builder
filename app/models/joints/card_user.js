const card_user_create = require('./card_user_create');
const card_user_get = require('./card_user_get');
var mongoose = require('mongoose');

const userCardSchema = mongoose.Schema({
    cardId: String,
    userId: String,
    foil: Number,
    normal: Number
})

userCardSchema.index({ cardId: 1, userId: 1}, { unique: true });

userCardSchema.plugin(card_user_create);
userCardSchema.plugin(card_user_get);

var UserCard = mongoose.model("UserCard", userCardSchema);

module.exports = UserCard;
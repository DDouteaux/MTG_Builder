const disconnect = require('./user__disconnect');
const connect = require('./user__connect');
const create = require('./user__create');
const getUserData = require('./user__getUser');
var mongoose = require('mongoose');

const userSchema = mongoose.Schema({
        userId: { type: String, unique: true },
        pseudo : String,
        password : String,
        avatar: String
})

userSchema.plugin(disconnect);
userSchema.plugin(create);
userSchema.plugin(connect);
userSchema.plugin(getUserData);

var User = mongoose.model("User", userSchema);

module.exports = User;
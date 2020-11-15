const disconnect = require('./user__disconnect');
const connect = require('./user__connect');
const create = require('./user__create');
const getUserData = require('./user__getUser');
const getAllUsers = require('./user__getAll');
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
userSchema.plugin(getAllUsers)

var User = mongoose.model("User", userSchema);

module.exports = User;
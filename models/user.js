var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

mongoose.connect('mongodb://localhost/nodeauth');
var db = mongoose.connection;

//user schema
var userSchema = mongoose.Schema({
    username: {
        type: String,
        index: true
    },
    password: {
        type: String
    },
    email: {
        type: String
    },
    name: {
        type: String
    },
    dp: {
        type: String
    }

});


var User = mongoose.model('User', userSchema);

module.exports = User;

module.exports.getUserById = function (id, callback) {
    User.findById(id, callback);

};

module.exports.getUserByUsername = function (username, callback) {
    var query = {
        username: username
    };
    User.findOne(query, callback);
    console.log('yo user');
};

module.exports.comparePassword = function (candidatePassword, hash, callback) {
    bcrypt.compare(candidatePassword, hash, function (err, isMatch) {
        callback(null, isMatch);
    });
    console.log('yo pwd');

};

module.exports.createUser = function (newUser, callback) {
    bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash(newUser.password, salt, function (err, hash) {
            newUser.password = hash;
            newUser.save(callback);
        });
    });
};

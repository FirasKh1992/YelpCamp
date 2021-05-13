const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unigue: true
    }
})
//this is gonna to add on on ure schema  a username and a password
//its goona give us the username are unige and not deplicated.
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);

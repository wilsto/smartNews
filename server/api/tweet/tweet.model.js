'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var TweetSchema = new Schema({
    account: String,
    text: String,
    media: String,
    date: Date,
    done: Boolean
});

module.exports = mongoose.model('Tweet', TweetSchema);
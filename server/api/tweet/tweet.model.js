'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var TweetSchema = new Schema({
    area: String,
    subarea: String,
    name: String,
    thing: String,
    filter: String,
    account: String,
    scheduleCron: String,
    state: String,
    lastDateRun: Date,
    errorNb: Number,
    active: Boolean
});

module.exports = mongoose.model('Tweet', TweetSchema);

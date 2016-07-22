'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var FeedSchema = new Schema({
    type: String,
    subarea: String,
    name: String,
    language: String,
    url: String,
    website: String,
    twitter: String,
    author: String,
    image: String,
    lastChecked: Date,
    lastFetchedNb: Number,
    lastErrorNb: Number,
    lastOutdatedNb: Number,
    state: String,
    active: Boolean
});

module.exports = mongoose.model('Feed', FeedSchema);

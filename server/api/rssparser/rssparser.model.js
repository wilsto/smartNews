'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var RssparserSchema = new Schema({
    _feed: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Feed'
    }],
    guid: String,
    title: String,
    date: Date,
    summary: String,
    description: String,
    link: String,
    author: String,
    read: Boolean,
    starred: Boolean
});

module.exports = mongoose.model('Rssparser', RssparserSchema);
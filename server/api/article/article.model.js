'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ArticleSchema = mongoose.Schema({
    _feed: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Feed'
    },
    guid: String,
    title: String,
    softTitle: String,
    date: Date,
    summary: String,
    description: String,
    image: String,
    videos: Schema.Types.Mixed,
    keywords: Schema.Types.Mixed,
    tags: Schema.Types.Mixed,
    lang: String,
    link: String,
    text: String,
    topics: Schema.Types.Mixed,
    bigWords: Schema.Types.Mixed,
    terms: Schema.Types.Mixed,
    words: Number,
    sentiment: Number,
    difficulty: Number,
    minutes: Number,
    canonicalLink: String,
    author: Schema.Types.Mixed,
    score: Number,
    read: Boolean,
    starred: Boolean,
    analysed: Boolean,
    shared: Boolean
});

module.exports = mongoose.model('Article', ArticleSchema);

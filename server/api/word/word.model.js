'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var WordSchema = new Schema({
    term: String,
    like: Number,
    words: [],
    type: String,
    score: Number,
    active: Boolean
});

module.exports = mongoose.model('Word', WordSchema);

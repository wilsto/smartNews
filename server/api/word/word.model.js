'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var WordSchema = new Schema({
    term: String,
    active: Boolean,
    like: Number,
    interestCenters: Schema.Types.Mixed
});

module.exports = mongoose.model('Word', WordSchema);
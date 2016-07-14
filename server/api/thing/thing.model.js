'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ThingSchema = new Schema({
    name: String,
    info: String,
    icon: String,
    url: String,
    active: Boolean,
    available: Schema.Types.Mixed,
    waitToShare: Schema.Types.Mixed

});

module.exports = mongoose.model('Thing', ThingSchema);

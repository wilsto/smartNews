'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var LogSchema = new Schema({
    actor: String,
    date: Date,
    orgin: String,
    action: String,
    label: String,
    object: String,
    desctiption: Boolean
});

module.exports = mongoose.model('auditlogs', LogSchema);

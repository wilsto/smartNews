'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var TwitterRuleSchema = new Schema({
    account: String,
    area: String,
    subarea: String,
    name: String,
    path: String,
    params: String,
    filter: String,
    state: String,
    lastDateRun: Date,
    errorNb: Number,
    active: Boolean
});

module.exports = mongoose.model('TwitterRules', TwitterRuleSchema);

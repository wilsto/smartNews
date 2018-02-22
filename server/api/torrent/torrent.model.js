'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var TorrentSchema = new Schema({
  category: String,
  pattern: String,
  currentMonth: Boolean,
  active: Boolean,
  state: String,
  stateDetails: String,
  lastChecked: Date,
  hasErrors: Number
});

module.exports = mongoose.model('Torrent', TorrentSchema);

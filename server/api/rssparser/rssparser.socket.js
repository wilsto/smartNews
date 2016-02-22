/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Rssparser = require('./rssparser.model');

exports.register = function(socket) {
  Rssparser.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Rssparser.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('rssparser:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('rssparser:remove', doc);
}
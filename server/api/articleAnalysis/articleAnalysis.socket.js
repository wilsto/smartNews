/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var ArticleAnalysis = require('./articleAnalysis.model');

exports.register = function(socket) {
  ArticleAnalysis.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  ArticleAnalysis.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('articleAnalysis:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('articleAnalysis:remove', doc);
}
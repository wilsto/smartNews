/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Tweeteur = require('./tweeteur.model');

exports.register = function(socket) {
    Tweeteur.schema.post('save', function(doc) {
        onSave(socket, doc);
    });
    Tweeteur.schema.post('remove', function(doc) {
        onRemove(socket, doc);
    });
}

function onSave(socket, doc, cb) {
    socket.emit('tweeteur:save', doc);
}

function onRemove(socket, doc, cb) {
    socket.emit('tweeteur:remove', doc);
}

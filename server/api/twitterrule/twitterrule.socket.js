/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var TwitterRule = require('./twitterrule.model');

exports.register = function(socket) {
    TwitterRule.schema.post('save', function(doc) {
        onSave(socket, doc);
    });
    TwitterRule.schema.post('remove', function(doc) {
        onRemove(socket, doc);
    });
}

function onSave(socket, doc, cb) {
    socket.emit('twitterrule:save', doc);
}

function onRemove(socket, doc, cb) {
    socket.emit('twitterrule:remove', doc);
}

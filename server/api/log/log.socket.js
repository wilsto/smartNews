/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var log = require('./log.model');

exports.register = function(socket) {
    log.schema.post('save', function(doc) {
        onSave(socket, doc);
    });
    log.schema.post('remove', function(doc) {
        onRemove(socket, doc);
    });

    process.on('EmitLogEvent', function(data) {
        onSave(socket, data);
    });



}

function onSave(socket, doc, cb) {
    console.log('log:save********************************************', doc);
    if (doc.actor === 'Event') {
        socket.emit('logEvent:save', doc);
    } else {
        socket.emit('logError:save', doc);
    }
}

function onRemove(socket, doc, cb) {
    socket.emit('log:remove', doc);
}

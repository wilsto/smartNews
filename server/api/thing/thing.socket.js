/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var thing = require('./thing.model');

exports.register = function(socket) {
    thing.schema.post('save', function(doc) {
        onSave(socket, doc);
    });
    thing.schema.post('update', function(doc) {
        onSave(socket, doc);
    });
    thing.schema.post('remove', function(doc) {
        onRemove(socket, doc);
    });

    process.on('EmitCountArticles', function(data) {
        //socket.emit('EmitCountArticles');
        onSave(socket, data);
    });

}

function onSave(socket, doc, cb) {
    console.log('thing:save********************************************');
    socket.emit('thing:save', doc);
}

function onRemove(socket, doc, cb) {
    socket.emit('thing:remove', doc);
}

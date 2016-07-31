/**
 * Main application file
 */

'use strict';

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var express = require('express');
var mongoose = require('mongoose');
var config = require('./config/environment');

// Connect to database
mongoose.connect(config.mongo.uri, config.mongo.options);

// Populate DB with sample data
if (config.seedDB) { require('./config/seed'); }

// Setup server
var app = express();
var server = require('http').createServer(app);
var socketio = require('socket.io')(server, {
    serveClient: (config.env === 'production') ? false : true,
    path: '/socket.io-client'
});
require('./config/socketio')(socketio);
require('./config/express')(app);
require('./routes')(app);

// Start server
server.listen(config.port, config.ip, function() {
    console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
});

//add timestamps in front of log messages
require('console-stamp')(console, '[HH:MM:ss.l]');

var auditLog = require('audit-log');
var config = require('./config/environment');
auditLog.addTransport("mongoose", { connectionString: config.mongo.uri });
auditLog.addTransport("console");
//  method is logEvent( actor, origin, action, label, object, description ) 

process.on('uncaughtException', function(err) {
    auditLog.logEvent('Error', 'app.js', 'uncaughtException', err, '', '');
});

// Expose app
exports = module.exports = app;

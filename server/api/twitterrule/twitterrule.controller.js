'use strict';

var auditLog = require('audit-log');
var config = require('../../config/environment');
auditLog.addTransport("mongoose", { connectionString: config.mongo.uri });
//auditLog.addTransport("console");

var _ = require('lodash');

// models
var TwitterRule = require('./twitterrule.model');
var Article = require('../article/article.model');

// Get list of rules
exports.index = function(req, res) {
    TwitterRule.find(function(err, rules) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(200, rules);
    });
};

// Get a single rule
exports.show = function(req, res) {
    TwitterRule.findById(req.params.id, function(err, rule) {
        if (err) {
            return handleError(res, err);
        }
        if (!rule) {
            return res.send(404);
        }
        return res.json(rule);
    });
};

// Creates a new rule in the DB.
exports.create = function(req, res) {
    console.log(' req.body', req.body);
    TwitterRule.create(req.body, function(err, rule) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(201, rule);
    });
};

// Updates an existing rule in the DB.
exports.update = function(req, res) {
    if (req.body._id) {
        delete req.body._id;
    }
    TwitterRule.findById(req.params.id, function(err, rule) {
        if (err) {
            return handleError(res, err);
        }
        if (!rule) {
            return res.send(404);
        }
        var updated = _.merge(rule, req.body);
        updated.save(function(err) {
            if (err) {
                return handleError(res, err);
            }
            return res.json(200, rule);
        });
    });
};

// Deletes a rule from the DB.
exports.destroy = function(req, res) {
    TwitterRule.findById(req.params.id, function(err, rule) {
        if (err) {
            return handleError(res, err);
        }
        if (!rule) {
            return res.send(404);
        }
        rule.remove(function(err) {
            if (err) {
                return handleError(res, err);
            }
            return res.send(204);
        });
    });
};

function handleError(res, err) {
    return res.send(500, err);
}

'use strict';

var auditLog = require('audit-log');
var config = require('../../config/environment');
auditLog.addTransport("mongoose", { connectionString: config.mongo.uri });
//auditLog.addTransport("console");

var _ = require('lodash');
var Twit = require('twit');
var schedule = require('node-schedule');

// configuration
var conf = require('../config.json');

// models
var Tweeteurs = require('./tweeteur.model');


var cursorFriends = -1;
var cursorFollowers = -1;

function ListFriends(account) {
    var T = [];
    T[account] = new Twit({
        consumer_key: conf['consumer_key_' + account],
        consumer_secret: conf['consumer_secret_' + account],
        access_token: conf['access_token_' + account],
        access_token_secret: conf['access_token_secret_' + account],
        timeout_ms: 60 * 1000, // optional HTTP request timeout to apply to all requests. 
    });

    var params = { screen_name: account, count: 200, cursor: cursorFriends };
    T[account].get('friends/list', params, function(err, data, response) {
        if (data.errors) {
            console.log('friends errors', data.errors);
        }
        _.each(data.users, function(user) {
            user.account = account;
            user.type = 'friends';
            Tweeteurs.findOrCreate({ id_str: user.id_str, type: 'friends' }, user, function(err, article, created) {
                if (created) {
                    console.log('new tweeteur suivi', user.screen_name);
                    //auditLog.logEvent('Event', 'feed.controller.js - function refreshFeed', 'New Article', feed.name + ' : ' + article.title, article.guid, article.title);
                } else {
                    //console.log('already tweeteur ', user.screen_name);
                    //console.log(' Exist :' + article.guid)
                }
                if (err) {
                    console.log('err', err);
                    // go through all the errors...
                    //auditLog.logEvent('Error', 'feed.controller.js - function refreshFeed -  Article.create', 'Detect Error', err, feed.url, article.guid);
                }
            });
        });
        if (data.next_cursor !== 0 && data.next_cursor !== undefined) {
            cursorFriends = data.next_cursor;
            new ListFriends(account);
        }
    });
}

function ListFollowers(account) {
    var T = [];
    T[account] = new Twit({
        consumer_key: conf['consumer_key_' + account],
        consumer_secret: conf['consumer_secret_' + account],
        access_token: conf['access_token_' + account],
        access_token_secret: conf['access_token_secret_' + account],
        timeout_ms: 60 * 1000, // optional HTTP request timeout to apply to all requests. 
    });
    var params = { screen_name: account, count: 200, cursor: cursorFollowers };
    T[account].get('followers/list', params, function(err, data, response) {
        if (data.errors) {
            console.log('followers errors', data.errors);
        }
        _.each(data.users, function(user) {
            user.account = account;
            user.type = 'followers';
            Tweeteurs.findOrCreate({ id_str: user.id_str, type: 'followers' }, user, function(err, article, created) {
                if (created) {
                    console.log('new follower', user.screen_name);
                    //auditLog.logEvent('Event', 'feed.controller.js - function refreshFeed', 'New Article', feed.name + ' : ' + article.title, article.guid, article.title);
                } else {
                    //console.log('already follower ', user.screen_name);
                    //console.log(' Exist :' + article.guid)
                }
                if (err) {
                    console.log('err', err);
                    // go through all the errors...
                    //auditLog.logEvent('Error', 'feed.controller.js - function refreshFeed -  Article.create', 'Detect Error', err, feed.url, article.guid);
                }
            });
        });
        if (data.next_cursor !== 0 && data.next_cursor !== undefined) {
            cursorFollowers = data.next_cursor;
            new ListFollowers(account);
        }

    });
}

new ListFriends('willSTOPHE');
new ListFollowers('willSTOPHE');

// Get list of tweeteurs
exports.index = function(req, res) {
    Tweeteurs.find(function(err, tweeteurs) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(200, tweeteurs);
    });
};


// Get list of tweeteurs
exports.groupByName = function(req, res) {
    console.log('test');
    Tweeteurs.aggregate([{
        $group: {
            _id: "$id_str",
            name: { $first: "$name" },
            screen_name: { $first: "$screen_name" },
            description: { $first: "$description" },
            profile_image_url: { $first: "$profile_image_url" },
            lang: { $first: "$lang" },
            followers_count: { $first: "$followers_count" },
            friends_count: { $first: "$friends_count" },
            willSTOPHE: { $push: { $cond: [{ $eq: ["$account", "willSTOPHE"] }, "$type", ""] } },
            leadbywill: { $push: { $cond: [{ $eq: ["$account", "leadbywill"] }, "$type", ""] } },
            geekbywill: { $push: { $cond: [{ $eq: ["$account", "geekbywill"] }, "$type", ""] } }
        }
    }, {
        $sort: {
            account: 1,
            screen_name: 1
        }
    }], function(err, tweeteurs) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(200, tweeteurs);
    });
};

// Get a single tweeteur
exports.show = function(req, res) {
    Tweeteurs.findById(req.params.id, function(err, tweeteur) {
        if (err) {
            return handleError(res, err);
        }
        if (!tweeteur) {
            return res.send(404);
        }
        return res.json(tweeteur);
    });
};

// Creates a new tweeteur in the DB.
exports.create = function(req, res) {
    console.log(' req.body', req.body);
    Tweeteurs.create(req.body, function(err, tweeteur) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(201, tweeteur);
    });
};

// Updates an existing tweeteur in the DB.
exports.update = function(req, res) {
    if (req.body._id) {
        delete req.body._id;
    }
    Tweeteurs.findById(req.params.id, function(err, tweeteur) {
        if (err) {
            return handleError(res, err);
        }
        if (!tweeteur) {
            return res.send(404);
        }
        var updated = _.merge(tweeteur, req.body);
        updated.save(function(err) {
            if (err) {
                return handleError(res, err);
            }
            return res.json(200, tweeteur);
        });
    });
};

// Deletes a tweeteur from the DB.
exports.destroy = function(req, res) {
    Tweeteurs.findById(req.params.id, function(err, tweeteur) {
        if (err) {
            return handleError(res, err);
        }
        if (!tweeteur) {
            return res.send(404);
        }
        tweeteur.remove(function(err) {
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

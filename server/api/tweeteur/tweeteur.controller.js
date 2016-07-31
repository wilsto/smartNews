'use strict';

var auditLog = require('audit-log');
var config = require('../../config/environment');

var _ = require('lodash');
var Twit = require('twit');
var schedule = require('node-schedule');

// configuration
var conf = require('../config.json');

// models
var Tweeteurs = require('./tweeteur.model');

var cursorFriends = [];
var cursorFollowers = [];
cursorFriends['willSTOPHE'] = -1;
cursorFriends['leadbywill'] = -1;
cursorFollowers['willSTOPHE'] = -1;
cursorFollowers['leadbywill'] = -1;

function ListFriends(account) {
    var T = [];
    T[account] = new Twit({
        consumer_key: conf['consumer_key_' + account],
        consumer_secret: conf['consumer_secret_' + account],
        access_token: conf['access_token_' + account],
        access_token_secret: conf['access_token_secret_' + account],
        timeout_ms: 60 * 1000 // optional HTTP request timeout to apply to all requests. 
    });

    var params = { screen_name: account, count: 200, cursor: cursorFriends[account] };
    T[account].get('friends/list', params, function(err, data, response) {
        if (data.errors) {
            console.log('friends errors ' + account, data.errors);
        }
        _.each(data.users, function(user) {
            user.account = account;
            user.type = 'friends';
            user.date = Date.now();
            Tweeteurs.update({ id_str: user.id_str, type: 'friends', account: account }, user, { upsert: true }, function(err, numberAffected, rawResponse) {
                if (rawResponse) {
                    console.log('new tweeteur suivi ' + account + ' :', user.screen_name);
                    //auditLog.logEvent('Event', 'feed.controller.js - function refreshFeed', 'New Article', feed.name + ' : ' + article.title, article.guid, article.title);
                } else {
                    //console.log('already tweeteur ', user.screen_name);
                    //console.log(' Exist :' + article.guid)
                }
                if (err) {
                    console.log('err ' + account, err);
                    // go through all the errors...
                    //auditLog.logEvent('Error', 'feed.controller.js - function refreshFeed -  Article.create', 'Detect Error', err, feed.url, article.guid);
                }
            });
        });
        if (data.next_cursor !== 0 && data.next_cursor !== undefined) {
            cursorFriends[account] = data.next_cursor;
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
        timeout_ms: 60 * 1000 // optional HTTP request timeout to apply to all requests. 
    });
    var params = { screen_name: account, count: 200, cursor: cursorFollowers[account] };
    T[account].get('followers/list', params, function(err, data, response) {
        if (data.errors) {
            console.log('followers errors ' + account, data.errors);
        }
        _.each(data.users, function(user) {
            user.account = account;
            user.type = 'followers';
            user.date = Date.now();
            Tweeteurs.update({ id_str: user.id_str, type: 'followers', account: account }, user, { upsert: true }, function(err, numberAffected, rawResponse) {
                if (rawResponse) {
                    console.log('new follower ' + account + ' :', user.screen_name);
                    //auditLog.logEvent('Event', 'feed.controller.js - function refreshFeed', 'New Article', feed.name + ' : ' + article.title, article.guid, article.title);
                } else {
                    //console.log('already follower ', user.screen_name);
                    //console.log(' Exist :' + article.guid)
                }
                if (err) {
                    console.log('err ' + account, err);
                    // go through all the errors...
                    //auditLog.logEvent('Error', 'feed.controller.js - function refreshFeed -  Article.create', 'Detect Error', err, feed.url, article.guid);
                }
            });
        });
        if (data.next_cursor !== 0 && data.next_cursor !== undefined) {
            cursorFollowers[account] = data.next_cursor;
            new ListFollowers(account);
        }

    });
}

new ListFriends('willSTOPHE');
new ListFollowers('willSTOPHE');

new ListFriends('leadbywill');
new ListFollowers('leadbywill');

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
            willSTOPHE: { $push: { $cond: [{ $eq: ["$account", "willSTOPHE"] }, "$type", false] } },
            leadbywill: { $push: { $cond: [{ $eq: ["$account", "leadbywill"] }, "$type", false] } },
            geekbywill: { $push: { $cond: [{ $eq: ["$account", "geekbywill"] }, "$type", false] } }
        }
    }, {
        "$project": {
            name: 1,
            screen_name: 1,
            description: 1,
            profile_image_url: 1,
            lang: 1,
            followers_count: 1,
            friends_count: 1,
            "willSTOPHE": {
                "$setDifference": ["$willSTOPHE", [false]]
            },
            "leadbywill": {
                "$setDifference": ["$leadbywill", [false]]
            }
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

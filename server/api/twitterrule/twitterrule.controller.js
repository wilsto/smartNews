'use strict';

var auditLog = require('audit-log');
var config = require('../../config/environment');

var _ = require('lodash');
var Twit = require('twit');
var schedule = require('node-schedule');

// configuration
var conf = require('../config.json');

// models
var TwitterRule = require('./twitterrule.model');
var Tweets = require('../tweet/tweet.model');

//tableau des rule accounts
var T = [];
var streamJob = [];

function CreateTweet(rule, tweet) {
    var newTweet = {
        account: rule.account,
        rule: rule._id,
        text: tweet.text,
        lang: tweet.lang,
        screen_name: tweet.user.screen_name,
        retweet_count: tweet.retweet_count,
        favorite_count: tweet.favorite_count,
        hashtags: tweet.entities.hashtags,
        urls: tweet.entities.urls,
        user_mentions: tweet.entities.user_mentions,
        symbols: tweet.entities.symbols,
        media: tweet.entities.media
    };

    Tweets.create(newTweet, function(err, tweet) {
        if (err) {
            console.log(err);
        }
        console.log('add tweet', rule.name + '  ' + tweet.text);
    });
}

function CaptureTweets(rule) {
    if (rule.path === 'user') {
        streamJob[rule._id] = T[rule.account].stream('user');
        streamJob[rule._id].on('error', function(err) {
            // handle the error here 
            auditLog.logEvent('Error', 'twitterrule.controller.js - function CaptureTweets', 'Stream - ' + rule.name, err, '');
        });
        streamJob[rule._id].on('tweet', function(tweet) {
            if (tweet.text.toLowerCase().indexOf(rule.filter) > -1 && tweet.text.toLowerCase().indexOf(rule.reject) === -1) {
                new CreateTweet(rule, tweet);
            }
        })
    }
}

function CapturTweetsBasedOnRules() {
    TwitterRule.find(function(err, rules) {
        if (err) {
            console.log('err', err);
        } else {
            _.each(rules, function(rule) {

                // création des comptes
                if (T[rule.account] === undefined) {
                    T[rule.account] = new Twit({
                        consumer_key: conf['consumer_key_' + rule.account],
                        consumer_secret: conf['consumer_secret_' + rule.account],
                        access_token: conf['access_token_' + rule.account],
                        access_token_secret: conf['access_token_secret_' + rule.account],
                        timeout_ms: 60 * 1000 // optional HTTP request timeout to apply to all requests.
                    });
                }

                // création des jobs CRON
                new CaptureTweets(rule);

            });
            //preparation to rule
        }
    });
}
//new CapturTweetsBasedOnRules();

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

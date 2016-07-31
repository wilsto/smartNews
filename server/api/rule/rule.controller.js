'use strict';

var auditLog = require('audit-log');
var config = require('../../config/environment');

var _ = require('lodash');
var Twit = require('twit');
var schedule = require('node-schedule');
var BitlyAPI = require("node-bitlyapi");
var request = require('request').defaults({
    encoding: null
});

// configuration
var conf = require('../config.json');

// models
var Rule = require('./rule.model');
var Article = require('../article/article.model');

//Configuration bitly
var Bitly = new BitlyAPI({
    client_id: conf.BitlyAPI_client_id,
    client_secret: conf.BitlyAPI_client_secret
});
Bitly.setAccessToken(conf.BitlyAPI_access_token);

//tableau des rule accounts
var T = [];

var articleToShare = function(rule) {
    var query = JSON.parse(rule.filter);
    Article.find(query).populate('_feed').exec().then(function(articles) {
        if (articles.length > 0) {

            var rand = Math.floor(Math.random() * articles.length);
            Article.find(query).populate('_feed').limit(-1).skip(rand).exec().then(function(articles) {

                var biggestTerm = _.filter(articles[0].terms, {
                    score: Math.max.apply(Math, articles[0].terms.map(function(o) {
                        return o.score;
                    }))
                });
                Bitly.shortenLink(articles[0].link, function(err, results) {
                    //Returns a shorter version of http://google.com - http://tinyurl.com/2tx
                    var BitlyURL = JSON.parse(results);
                    request.get(articles[0].image || articles[0]._feed.image, function(error, response, body) {
                        if (!error && response.statusCode === 200) {
                            var b64content = new Buffer(body).toString('base64');

                            // first we must post the media to Twitter
                            T[rule.account].post('media/upload', {
                                media_data: b64content
                            }, function(err, data, response) {

                                // now we can reference the media and post a rule (media will attach to the rule)
                                var mediaIdStr = data.media_id_string;
                                var TwitText = articles[0].title;
                                TwitText += ' @' + articles[0]._feed.twitter;
                                TwitText += (articles[0].subarea.toLowerCase() !== biggestTerm[0].term.toLowerCase()) ? ' #' + articles[0].subarea + ' #' + biggestTerm[0].term : ' #' + articles[0].subarea;
                                TwitText += ' - ' + BitlyURL.data.url;
                                var params = {
                                    status: TwitText,
                                    media_ids: [mediaIdStr]
                                }

                                T[rule.account].post('statuses/update', params, function(err, data, response) {
                                    if (err) {
                                        auditLog.logEvent('Error', 'rule.controller.js - function articleToShare', 'T.post/statuses/update', TwitText, 'err', err);
                                    } else {
                                        console.log('rule envoyé');
                                        var updatedArticle = articles[0];
                                        updatedArticle.shared = true;
                                        Article.findOneAndUpdate({ _id: updatedArticle._id }, updatedArticle, { new: true }).exec().then(function(updarticle) {
                                            auditLog.logEvent('Event', 'rule.controller.js - function articleToShare', 'T.post/statuses/update', TwitText, 'Article mis à jour', 'Article mis à jour et ruleé');
                                        });
                                    }

                                })

                            })
                        }
                    });

                });

            });
        }
    });

};

function ScheduleShareBasedOnRules() {
    var cronJob = [];
    Rule.find(function(err, rules) {
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
                        timeout_ms: 60 * 1000, // optional HTTP request timeout to apply to all requests.
                    });
                }

                // création des jobs CRON
                cronJob[rule._id] = schedule.scheduleJob(rule.scheduleCron || '0 9,13,15,17,19,21,23 * * *', function() {
                    setTimeout(function() {
                        articleToShare(rule);
                    }, Math.floor(Math.random() * 1000 * 60 * 45));
                });

            });
            //preparation to rule
        }
    });
}
new ScheduleShareBasedOnRules();

// Get list of rules
exports.index = function(req, res) {
    Rule.find(function(err, rules) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(200, rules);
    });
};

// Get a single rule
exports.show = function(req, res) {
    Rule.findById(req.params.id, function(err, rule) {
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
    Rule.create(req.body, function(err, rule) {
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
    Rule.findById(req.params.id, function(err, rule) {
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
    Rule.findById(req.params.id, function(err, rule) {
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

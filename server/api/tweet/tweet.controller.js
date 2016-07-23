'use strict';

var auditLog = require('audit-log');
var config = require('../../config/environment');
auditLog.addTransport("mongoose", { connectionString: config.mongo.uri });
//auditLog.addTransport("console");

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
var Tweet = require('./tweet.model');
var Article = require('../article/article.model');

//Configuration bitly
var Bitly = new BitlyAPI({
    client_id: conf.BitlyAPI_client_id,
    client_secret: conf.BitlyAPI_client_secret
});
Bitly.setAccessToken(conf.BitlyAPI_access_token);

//tableau des tweet accounts
var T = [];

var articleToShare = function(rule) {
    var query = JSON.parse(rule.filter);
    console.log('query', query);
    Article.find(query).populate('_feed').exec().then(function(articles) {
        console.log('articles.length', articles.length);
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

                                // now we can reference the media and post a tweet (media will attach to the tweet)
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
                                        auditLog.logEvent('Error', 'tweet.controller.js - function articleToShare', 'T.post/statuses/update', TwitText, 'err', err);
                                    } else {
                                        console.log('tweet envoyé');
                                        var updatedArticle = articles[0];
                                        updatedArticle.shared = true;
                                        Article.findOneAndUpdate({ _id: updatedArticle._id }, updatedArticle, { new: true }).exec().then(function(updarticle) {
                                            auditLog.logEvent('Event', 'tweet.controller.js - function articleToShare', 'T.post/statuses/update', TwitText, 'Article mis à jour', 'Article mis à jour et tweeté');
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
    Tweet.find(function(err, rules) {
        if (err) {
            console.log('err', err);
        } else {
            _.each(rules, function(rule) {
                T[rule.account] = new Twit({
                    consumer_key: conf['consumer_key_' + rule.account],
                    consumer_secret: conf['consumer_secret_' + rule.account],
                    access_token: conf['access_token_' + rule.account],
                    access_token_secret: conf['access_token_secret_' + rule.account],
                    timeout_ms: 60 * 1000, // optional HTTP request timeout to apply to all requests.
                });

                cronJob[rule.account] = schedule.scheduleJob(rule.scheduleCron || '0 9,13,15,17,19,21,23 * * *', function() {
                    setTimeout(function() {
                        console.log('The answer to life, the universe, and everything!');
                        articleToShare(rule);
                    }, Math.floor(Math.random() * 1000));
                });

            });
            //preparation to tweet
            console.log('T', T);
            console.log('cronJob', cronJob);
        }
    });
}
new ScheduleShareBasedOnRules();




// Get list of tweets
exports.index = function(req, res) {
    Tweet.find(function(err, tweets) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(200, tweets);
    });
};

// Get a single tweet
exports.show = function(req, res) {
    Tweet.findById(req.params.id, function(err, tweet) {
        if (err) {
            return handleError(res, err);
        }
        if (!tweet) {
            return res.send(404);
        }
        return res.json(tweet);
    });
};

// Creates a new tweet in the DB.
exports.create = function(req, res) {
    console.log(' req.body', req.body);
    Tweet.create(req.body, function(err, tweet) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(201, tweet);
    });
};

// Updates an existing tweet in the DB.
exports.update = function(req, res) {
    if (req.body._id) {
        delete req.body._id;
    }
    Tweet.findById(req.params.id, function(err, tweet) {
        if (err) {
            return handleError(res, err);
        }
        if (!tweet) {
            return res.send(404);
        }
        var updated = _.merge(tweet, req.body);
        updated.save(function(err) {
            if (err) {
                return handleError(res, err);
            }
            return res.json(200, tweet);
        });
    });
};

// Deletes a tweet from the DB.
exports.destroy = function(req, res) {
    Tweet.findById(req.params.id, function(err, tweet) {
        if (err) {
            return handleError(res, err);
        }
        if (!tweet) {
            return res.send(404);
        }
        tweet.remove(function(err) {
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

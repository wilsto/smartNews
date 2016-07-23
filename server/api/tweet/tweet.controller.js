'use strict';

var auditLog = require('audit-log');
var config = require('../../config/environment');
auditLog.addTransport("mongoose", { connectionString: config.mongo.uri });
//auditLog.addTransport("console");

var _ = require('lodash');
var Twit = require('twit');

// configuration
var conf = require('../config.json');

// models
var Tweets = require('./tweet.model');


var streamT = new Twit({
    consumer_key: conf['consumer_key_willSTOPHE'],
    consumer_secret: conf['consumer_secret_willSTOPHE'],
    access_token: conf['access_token_willSTOPHE'],
    access_token_secret: conf['access_token_secret_willSTOPHE'],
    timeout_ms: 60 * 1000, // optional HTTP request timeout to apply to all requests.
});

// same result as doing { track: 'bananas,oranges,strawberries' }
var stream_willSTOPHE = streamT.stream('user');
stream_willSTOPHE.on('tweet', function(tweet) {
    if (tweet.text.toLowerCase().indexOf('#quote') > -1) {
        var newTweet = {
            account: 'willSTOPHE',
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
            console.log('add tweet', tweet.text);
        });
    }
})

// Get list of tweets
exports.index = function(req, res) {
    Tweets.find(function(err, tweets) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(200, tweets);
    });
};

// Get a single tweet
exports.show = function(req, res) {
    Tweets.findById(req.params.id, function(err, tweet) {
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
    Tweets.create(req.body, function(err, tweet) {
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
    Tweets.findById(req.params.id, function(err, tweet) {
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
    Tweets.findById(req.params.id, function(err, tweet) {
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

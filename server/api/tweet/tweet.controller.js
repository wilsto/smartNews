'use strict';

var _ = require('lodash');
var Parser = require('../../NLTK/parser');
var Q = require("q");
var request = require("request");

function expandUrl(shortUrl) {
    return Q.ncall(request, null, {
        method: "HEAD",
        url: shortUrl,
        followAllRedirects: true
            // If a callback receives more than one (non-error) argument
            // then the promised value is an array. We want element 0.
    }).get('0').get('request').get('href');
}

// models
var Tweets = require('./tweet.model');


function processTweetLinks(text) {
    var exp = /RT/gm;
    text = text.replace(exp, '');
    exp = /"/gim;
    text = text.replace(exp, '');
    exp = /via /gim;
    text = text.replace(exp, '');
    exp = /.@/gim;
    text = text.replace(exp, '@');

    exp = /(ftp|http|https|file):\/\/[\S]+(\b|$)/gim;
    text = text.replace(exp, '');
    exp = /(^|\s)#(\w+)/g;
    text = text.replace(exp, '');
    exp = /(^|\s)@(\w+)/g;
    text = text.replace(exp, '');

    exp = /~/gim;
    text = text.replace(exp, '');
    exp = /-/gim;
    text = text.replace(exp, '');
    exp = /:/gim;
    text = text.replace(exp, '');
    return text.trim();
}

var tweetAnalys = function(query) {
    console.log('tweetAnalys***********');

    Tweets.find(query).exec().then(function(tweets) {
        _.each(tweets, function(tweet) {
            // update document, using its own properties
            tweet.Cleantext = processTweetLinks(tweet.text);

            // for each url
            /*expandUrl("http://t.co/Zc3cUoly")
    .then(function(longUrl) {
        console.log(longUrl);
    });
*/

            // save the updated document
            Tweets.update({ _id: tweet._id }, tweet, function(updateTweet) {
                console.log('updateTweet', tweet.Cleantext);
            });
        });
    });
}

// tweetAnalys toutes les heures
var timer = setInterval(function() {
    console.log('*** Tweet Analyse Automatic -- Simple 1 hour');
    tweetAnalys({ Cleantext: { $exists: false } });
}, 1 * 60 * 1000);

// tweetAnalys toutes les heures
var timer = setInterval(function() {
    console.log('*** Tweet Analyse Automatic -- Simple 1 day');
    tweetAnalys({});
}, 24 * 60 * 60 * 1000);


exports.countTweets = function(req, res) {
    Tweets.find({}).exec().then(function(tweets) {
        res.status(200).send({ nbTweets: tweets.length });
    });
}

// Get list of tweets
exports.index = function(req, res) {
    if (typeof req.query.after === 'undefined') {
        req.query.after = 0;
    }
    var after = parseInt(req.query.after);
    Tweets.find({}).populate('rule').skip(after).limit(50).sort({ date: -1 }).exec().then(function(tweets) {
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
    req.body.Cleantext = processTweetLinks(tweet.text);

    Tweets.create(req.body, function(err, tweet) {
        if (err) {
            return handleError(res, err);
        }
        tweetAnalys();
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

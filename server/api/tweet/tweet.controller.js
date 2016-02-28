'use strict';

var _ = require('lodash');
var Tweet = require('./tweet.model');
var Twit = require('twit');
var schedule = require('node-schedule');
var conf = require('../config.json');

//preparation to tweet
var T = new Twit({
    consumer_key: conf.consumer_key,
    consumer_secret: conf.consumer_secret,
    access_token: conf.access_token,
    access_token_secret: conf.access_token_secret,
    timeout_ms: 60 * 1000, // optional HTTP request timeout to apply to all requests.
});
var request = require('request').defaults({
    encoding: null
});

var j = schedule.scheduleJob('0 9,13,15,17,19,21,23 * * *', function() {
    console.log('The answer to life, the universe, and everything!');
});

// retrieve image online

request.get('https://www.mindtools.com/media/Images/Articles/Career_Skills/Key_Career_Points/IS_9810839_slobo_226x150.jpg', function(error, response, body) {
    if (!error && response.statusCode == 200) {
        var b64content = new Buffer(body).toString('base64');

        // first we must post the media to Twitter
        T.post('media/upload', {
            media_data: b64content
        }, function(err, data, response) {

            // now we can reference the media and post a tweet (media will attach to the tweet)
            var mediaIdStr = data.media_id_string
            var params = {
                status: 'loving life #nofilter',
                media_ids: [mediaIdStr]
            }

            T.post('statuses/update', params, function(err, data, response) {
                console.log(data)
            })
        })

    }
});

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
'use strict';
var request = require('request');
var FeedParser = require('feedparser');

var _ = require('lodash');
var Feed = require('./feed.model');
var Article = require('../article/article.model');
var async = require('async');
var conf = require('../config.json');

// Feeds functions

var timer = setInterval(function() {
    console.log('refreshFeeds auto');
    var req = {};
    req.query = {};
    var res = {}
    refreshFeeds(req, res);
}, 60 * 60 * 1000)

var refreshFeeds = function(req, res) {
    Feed.find().exec().then(function(feeds) {
        async.map(feeds, refreshFeed, function(err, feeds) {
            if (conf.activePeriod != -1) {
                var now = new Date();
                var bound = new Date();
                bound.setMonth(bound.getMonth() - conf.activePeriod);
                Article.remove({
                    starred: false
                }).where('date').lt(bound).exec().then(function(nbArticles) {
                    res.json(feeds);
                });
                process.emit('analysNewArticles', feeds);
            } else res.json(feeds);
        });
    });
};

exports.refreshFeeds = refreshFeeds;

exports.getFeed = function(req, res) {
    var id = req.params.id;
    var feed = Feed.findById(id).exec();
    feed.then(function(feed) {
        res.json(feed);
    });
};

exports.getFeeds = function(req, res) {
    Feed.find().exec().then(function(feeds) {
        res.json(feeds);
    });
};

exports.delFeed = function(req, res) {
    var id = req.params.id;
    Article.remove({
        _feed: id
    }).exec().then(function(articles) {
        Feed.remove({
            _id: id
        }).exec().then(function(feed) {
            res.status(200).send();
        });
    });
};

exports.addFeed = function(req, res) {
    var url = req.body.url;
    var addFeed = new Feed({
        name: url,
        url: url,
        state: 'New',
        lastFetched: 0,
        lastErrors: 0,
        lastOudated: 0
    });
    Feed.create(addFeed).then(function(addFeed) {
        res.status(200).send(addFeed);
    });
};

exports.updateFeed = function(req, res) {
    var query = {
        _id: req.body._id
    };
    var update = {
        name: req.body.name,
        url: req.body.url,
    }
    Feed.findOneAndUpdate(query, update).exec().then(function(feed) {
        res.status(200).send(feed);
    });
};

// Get list of feeds
exports.index = function(req, res) {
    Feed.find(function(err, feeds) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(200, feeds);
    });
};

function refreshFeed(feed, callBack) {
    var articles = [];
    var feedMeta;
    var errors = 0;
    var outdated = 0;
    var req = request(feed.url);
    var feedParser = new FeedParser();
    req.on('error', function(error) {
        callBack(error);
    });
    req.on('response', function(res) {
        var stream = this;
        if (res.statusCode != 200) callback(new Error('Bad status code'));
        stream.pipe(feedParser);
    });
    feedParser.on('error', function(error) {
        callBack(error);
    });
    feedParser.on('meta', function(meta) {
        feedMeta = this.meta;
    });
    feedParser.on('readable', function() {
        var stream = this;
        var item;
        console.log('feed.name', feed.name);

        while (item = stream.read()) {
            var candidate = extractArticle(item, feed);
            if (checkValues(candidate)) {
                if (checkPeriod(candidate)) {
                    articles.push(candidate);
                } else outdated++;
            } else {
                console.log('candidate', candidate);
                errors++;
            }
        }
    });
    feedParser.on('end', function() {
        var guids = articles.map(function(article) {
            return article.guid;
        });
        Article.find({
            _feed: feed._id
        }).where('guid').in(guids).exec().then(function(existingArticles) {
            var existingGuids = existingArticles.map(function(article) {
                return article.guid;
            });
            var newArticles = [];
            for (var i = 0; i < articles.length; i++) {
                var cur = articles[i];
                if (existingGuids.indexOf(cur.guid) == -1) newArticles.push(cur);
            }
            Article.create(newArticles, function(err) {
                var state = (errors > 0) ? 'Incomplete' : 'OK';
                var values = {
                    lastChecked: new Date(),
                    lastFetchedNb: newArticles.length,
                    lastErrorNb: errors,
                    lastOutdatedNb: outdated,
                    state: state
                };
                Feed.findOneAndUpdate({
                    _id: feed._id
                }, values).exec().then(function(feed) {
                    callBack(null, feed);
                });
            });
        });
    });
}


function checkValues(article) {
    if (article.date == undefined) return false;
    else if (article.title == undefined) return false;
    else if (article.link == undefined) return false;
    else return true;
}

function checkPeriod(article) {
    if (conf.activePeriod == -1) return true;
    else if (monthsDiff(article.date, new Date()) > conf.activePeriod) return false;
    else return true;
}

function compareArticles(a1, a2) {
    return new Date(a2.date).getTime() - new Date(a1.date).getTime();
}



function extractArticle(item, feed) {
    return new Article({
        title: item.title,
        // summary: item.summary,
        description: item.description,
        //author: item.author,
        date: Date.parse(item.date) || Date.parse(item.pubDate) || Date.now(),
        link: item.link,
        guid: item.guid,
        _feed: feed._id,
        read: false,
        starred: false
    });
}


// Utility functions

function monthsDiff(d1, d2) {
    return d2.getMonth() - d1.getMonth() + (12 * (d2.getFullYear() - d1.getFullYear()));
}

function handleError(res, err) {
    return res.send(500, err);
}
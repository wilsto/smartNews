'use strict';
var auditLog = require('audit-log');
var config = require('../../config/environment');

var request = require('request');
var _ = require('lodash');
var FeedParser = require('feedparser');

var Feed = require('./feed.model');
var Article = require('../article/article.model');
var async = require('async');
var conf = require('../config.json');
var articles = [];
var state;

var refreshFeeds = function(req, res) {
    console.log('(-- refreshFeeds start ');
    Feed.find({ active: true }).exec().then(function(feeds) {
        async.map(feeds, refreshFeed, function(err, feeds) {
            console.log('refreshFeeds end --)');
        });
    });
};

exports.refreshFeeds = refreshFeeds;

// Feeds functions
var timer = setInterval(function() {
    console.log('*** refreshFeeds auto - 5 min');
    var req = {};
    req.query = {};
    var res = {};
    refreshFeeds(req, res);
}, 5 * 60 * 1000);

refreshFeeds();

var refreshOneFeed = function(req, res) {
    var id = req.params.id;
    Feed.find({ _id: id }).exec().then(function(feeds) {
        async.map(feeds, refreshFeed, function(err, feeds) {
            process.emit('AnalyseNewArticles', { query: { _feed: id } });
            res.json(feeds);
        });
    });
};

exports.refreshOneFeed = refreshOneFeed;

exports.getFeed = function(req, res) {
    var id = req.params.id;
    var feed = Feed.findById(id).exec();
    feed.then(function(feed) {
        res.json(feed);
    });
};

exports.getFeeds = function(req, res) {
    Feed.find().sort({ type: 1, subarea: 1, name: 1 }).exec().then(function(feeds) {
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
            auditLog.logEvent('Event', 'feed.controller.js - function delFeed', 'Delete Feed', feed.url, id, feed);
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
        auditLog.logEvent('Event', 'feed.controller.js - function addFeed', 'Add Feed', addFeed.url, addFeed._id, addFeed);
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
        website: req.body.website,
        twitter: req.body.twitter,
        image: req.body.image,
        author: req.body.author,
        type: req.body.type,
        subarea: req.body.subarea,
        language: req.body.language,
        active: req.body.active,
    }

    Feed.findOneAndUpdate(query, update).exec().then(function(feed) {
        auditLog.logEvent('Event', 'feed.controller.js - function updateFeed', 'Update Feed', feed.url, feed._id, feed);
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
    var feedMeta;
    var errors = 0;
    var outdated = 0;
    var state = 0;
    articles = [];
    var req = request(feed.url);
    var feedParser = new FeedParser();
    console.log(' -- Feed :', feed.url);

    req.on('error', function(error) {
        auditLog.logEvent('Error', 'feed.controller.js - function refreshFeed - req.on(error', 'Detect Error', feed.url, '', '');
        //callBack(error);
    });
    req.on('response', function(res) {
        var stream = this;
        if (res.statusCode !== 200) {
            auditLog.logEvent('Error', 'feed.controller.js - function refreshFeed - req.on(response', 'Detect Error', feed.url, '', '');
        }
        stream.pipe(feedParser);
    });
    feedParser.on('error', function(error) {
        auditLog.logEvent('Error', 'feed.controller.js - function refreshFeed - feedParser.on', 'Detect Error', feed.url, '', '');
        callBack(error);
    });
    feedParser.on('meta', function(meta) {
        feedMeta = this.meta;
    });
    feedParser.on('readable', function() {
        var stream = this;

        var item;
        //console.log('feed.name', feed.name);
        while (item = stream.read()) {
            var candidate = extractArticle(item, feed);
            if (checkValues(candidate)) {
                if (checkPeriod(candidate)) {
                    articles.push(candidate);

                    Article.findOrCreate({ guid: candidate.guid }, candidate, function(err, article, created) {
                        if (created) {
                            auditLog.logEvent('Event', 'feed.controller.js - function refreshFeed', 'New Article', feed.name + ' : ' + article.title, article.guid, article.title);
                        } else {
                            //console.log('already Exist :' + article.guid)
                        }
                        if (err) {
                            //console.log('err', err);
                            require('util').inspect(err);
                            // go through all the errors...
                            auditLog.logEvent('Error', 'feed.controller.js - function refreshFeed -  Article.create', 'Detect Error', err, feed.url, article.guid);
                            state++;
                        }
                    });
                } else outdated++;
            } else {
                //console.log('candidate', candidate);
                errors++;
            }
        }
    });
    feedParser.on('end', function() {
        var meta = this.meta;

        Feed.findOne({
            _id: feed._id
        }).exec().then(function(feed) {
            var values = {
                lastChecked: new Date(),
                lastFetchedNb: articles.length,
                lastErrorNb: errors,
                lastOutdatedNb: outdated,
                website: (meta.link) ? meta.link : feed.website,
                language: (meta.language) ? meta.language : feed.language,
                author: (feed.author) ? meta.feed : meta.author,
                image: (feed.image) ? feed.image : meta.image.url,
                state: (state > 0) ? 'Incomplete' : 'OK'
            };
            Feed.findOneAndUpdate({
                _id: feed._id
            }, values).exec().then(function(feed) {
                callBack(null, feed);
            });
        });
    });
}


function checkValues(article) {
    if (article.date === undefined) return false;
    else if (article.title === undefined) return false;
    else if (article.link === undefined) return false;
    else return true;
}

function checkPeriod(article) {
    if (conf.activePeriod === -1) return true;
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
        type: feed.type,
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

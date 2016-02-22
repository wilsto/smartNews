'use strict';

var _ = require('lodash');
var Article = require('./article.model');

exports.getArticles = function(req, res) {
    console.log('getArticles', 'run');
    Article.find({}).populate('_feed', 'name').exec().then(function(articles) {
        articles.sort(compareArticles);
        res.json(articles);
    });
}
exports.getUnreadArticles = function(req, res) {
    Article.find({
        read: false
    }).populate('_feed', 'name').exec().then(function(articles) {
        articles.sort(compareArticles);
        res.json(articles);
    });
}

exports.getReadArticles = function(req, res) {
    Article.find({
        read: true
    }).populate('_feed', 'name').exec().then(function(articles) {
        articles.sort(compareArticles);
        res.json(articles);
    });
}

exports.getStarredArticles = function(req, res) {
    Article.find({
        starred: true
    }).populate('_feed', 'name').exec().then(function(articles) {
        articles.sort(compareArticles);
        res.json(articles);
    });
}

exports.updateArticle = function(req, res) {
    var query = {
        _id: req.body._id
    };
    var update = {
        starred: req.body.starred,
        read: req.body.read,
    }
    Article.findOneAndUpdate(query, update).exec().then(function(article) {
        res.status(200).send(article);
    });
}


function compareArticles(a1, a2) {
    return new Date(a2.date).getTime() - new Date(a1.date).getTime();
}

// Utility functions

function monthsDiff(d1, d2) {
    return d2.getMonth() - d1.getMonth() + (12 * (d2.getFullYear() - d1.getFullYear()));
}

function handleError(res, err) {
    return res.send(500, err);
}
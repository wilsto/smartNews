'use strict';

var _ = require('lodash');
var Article = require('./article.model');

var getArticles = function(req, res) {

    var query = {};
    if (typeof req.query.after === 'undefined') {
        req.query.after = 0;
    }
    if (typeof req.query.read !== 'undefined') {
        query.read = req.query.read;
    }
    if (typeof req.query.starred !== 'undefined') {
        query.starred = req.query.starred;
    }
    if (typeof req.query.analys !== 'undefined') {
        query.score = (req.query.analys === 'true') ? {
            $gt: 0
        } : undefined;
    }
    if (typeof req.query.title !== 'undefined') {
        query.title = new RegExp(req.query.title, "i");
    }
    console.log('query', query);
    /*    Article.find(query, null, {
            skip: req.query.after,
            limit: 50
        }).sort({
            score: -1,
            date: -1
        }).populate('_feed', 'name').exec().then(function(articles) {
            console.log('articles', articles);
            articles.sort(compareArticles);
            res.json(articles);
        });*/
    var after = parseInt(req.query.after);
    Article.find(query).skip(after).limit(50).sort({
        score: -1,
        date: -1
    }).populate('_feed').exec().then(function(articles) {
        //articles.sort(compareArticles);
        res.json(articles);
    });
};
exports.getArticles = getArticles;


exports.countArticles = function(req, res) {
    var query = {};

    if (typeof req.query.after === 'undefined') {
        req.query.after = 0;
    }
    if (typeof req.query.read !== 'undefined') {
        query.read = req.query.read;
    }
    if (typeof req.query.starred !== 'undefined') {
        query.starred = req.query.starred;
    }
    if (typeof req.query.analys !== 'undefined') {
        query.score = (req.query.analys === 'true') ? {
            $gt: 0
        } : undefined;
    }
    if (typeof req.query.title !== 'undefined') {
        query.title = new RegExp(req.query.title, "i");
    }

    Article.find(query).exec().then(function(articles) {
        res.status(200).send({ nbArticles: articles.length });
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

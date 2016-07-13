'use strict';

var _ = require('lodash');
var Rssparser = require('./rssparser.model');

var FeedParser = require('feedparser'),
    request = require('request');


// Get list of rssparsers
exports.index = function(req, res) {


    var req = request('http://feeds.inc.com/home/updates?format=xml'),
        feedparser = new FeedParser();

    req.on('error', function(error) {
        // handle any request errors
    });
    req.on('response', function(res) {
        var stream = this;

        if (res.statusCode != 200) return this.emit('error', new Error('Bad status code'));

        stream.pipe(feedparser);
    });


    feedparser.on('error', function(error) {
        // always handle errors
    });
    feedparser.on('readable', function() {
        // This is where the action is!
        var stream = this,
            meta = this.meta // **NOTE** the "meta" is always available in the context of the feedparser instance
            ,
            item;

        while (item = stream.read()) {
            //console.log(item.title);
        }
    });

};

// Get a single rssparser
exports.show = function(req, res) {
    Rssparser.findById(req.params.id, function(err, rssparser) {
        if (err) {
            return handleError(res, err);
        }
        if (!rssparser) {
            return res.send(404);
        }
        return res.json(rssparser);
    });
};

// Creates a new rssparser in the DB.
exports.create = function(req, res) {
    Rssparser.create(req.body, function(err, rssparser) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(201, rssparser);
    });
};

// Updates an existing rssparser in the DB.
exports.update = function(req, res) {
    if (req.body._id) {
        delete req.body._id;
    }
    Rssparser.findById(req.params.id, function(err, rssparser) {
        if (err) {
            return handleError(res, err);
        }
        if (!rssparser) {
            return res.send(404);
        }
        var updated = _.merge(rssparser, req.body);
        updated.save(function(err) {
            if (err) {
                return handleError(res, err);
            }
            return res.json(200, rssparser);
        });
    });
};

// Deletes a rssparser from the DB.
exports.destroy = function(req, res) {
    Rssparser.findById(req.params.id, function(err, rssparser) {
        if (err) {
            return handleError(res, err);
        }
        if (!rssparser) {
            return res.send(404);
        }
        rssparser.remove(function(err) {
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

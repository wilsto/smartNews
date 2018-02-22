'use strict';

var _ = require('lodash');
var Book = require('./book.model');

var getBooks = function(req, res) {

    var query = {};
    if (typeof req.query.after === 'undefined') {
        req.query.after = 0;
    }
    if (typeof req.query.area !== 'undefined') {
        query.type = req.query.area;
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
    var after = parseInt(req.query.after);
    Book.find(query).skip(after).limit(50).sort({
        score: -1,
        date: -1
    }).populate('_feed').exec().then(function(books) {
        //books.sort(compareBooks);
        res.json(books);
    });
};
exports.getBooks = getBooks;


exports.countBooks = function(req, res) {
    var query = {};

    if (typeof req.query.after === 'undefined') {
        req.query.after = 0;
    }
    if (typeof req.query.area !== 'undefined') {
        query.type = req.query.area;
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

    Book.find(query).exec().then(function(books) {
        res.status(200).send({ nbBooks: books.length });
    });
}

exports.updateBook = function(req, res) {
    var query = {
        _id: req.body._id
    };
    var update = {
        starred: req.body.starred,
        read: req.body.read,
        like: req.body.like
    }
    Book.findOneAndUpdate(query, update).exec().then(function(book) {
        process.emit('CountBooks');
        res.status(200).send(book);
    });
}


function compareBooks(a1, a2) {
    return new Date(a2.date).getTime() - new Date(a1.date).getTime();
}

// Utility functions

function monthsDiff(d1, d2) {
    return d2.getMonth() - d1.getMonth() + (12 * (d2.getFullYear() - d1.getFullYear()));
}

function handleError(res, err) {
    return res.send(500, err);
}

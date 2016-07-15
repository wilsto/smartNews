'use strict';

var _ = require('lodash');
var Word = require('./word.model');
var Article = require('../article/article.model');
var wordsList = [];

Word.find().sort({ type: 1, term: 1 }).exec().then(function(dbterms) {
    _.each(dbterms, function(dbterm) {
        wordsList.push(dbterm.type + '-' + dbterm.term);
    });
    wordsList = _.uniqBy(wordsList);
});

process.on('UpdateWords', function(article) {
    //console.log('article', article);
    _.map(article.terms, function(articleTerm, key) {
        // from text to array
        var arrWords = articleTerm.word.split(' ');
        arrWords = _.uniqBy(arrWords);
        var result = wordsList.indexOf(article.type + '-' + articleTerm.term);
        if (result === -1) {
            var created = { term: articleTerm.term, words: arrWords, type: article.type, like: undefined, active: true };
            wordsList.push(article.type + '-' + articleTerm.term);
            Word.create(created, function(err) {
                if (err) {
                    console.log('err', err);
                }
                console.log('create term : ', created.type + ' - ' + created.term);
            });
        } else {
            Word.find({ term: articleTerm.term, type: article.type }, function(err, dbterm) {
                var updated = {};
                updated.term = dbterm[0].term;
                updated.like = dbterm[0].like || 0;
                updated.active = dbterm[0].active || true;
                updated.type = article.type;

                var updatedArrWords = _.remove(arrWords.concat(dbterm.words), undefined);
                updatedArrWords = _.uniqBy(updatedArrWords);
                updated.words = updatedArrWords;

                Word.update({ _id: dbterm._id, type: article.type }, updated, function(err, numberaffected) {
                    if (err) {
                        console.log('err', err);
                    }
                    console.log('update term : ', updated.type + ' - ' + updated.term);
                });
            });
        }
    });
});

process.on('UpdateScoreWords', function(article) {
    Article.find().sort({ type: 1 }).exec().then(function(articles) {
        var words = [];
        _.each(articles, function(article) {
            _.each(article.terms, function(term) {
                words.push({
                    type: article.type,
                    term: term.term,
                    score: 1
                });
            });
        });

        function sum(numbers) {
            return _.reduce(numbers, function(result, current) {
                return result + parseFloat(current);
            }, 0);
        }

        var groups = _.chain(words)
            .groupBy('type')
            .map(function(value, type_key) {
                return _.chain(value)
                    .groupBy('term')
                    .map(function(value1, term_key) {
                        return {
                            type: type_key,
                            term: term_key,
                            score: sum(_.map(value1, 'score')),
                        }
                    })
                    .value();
            })
            .value();
        /*s*/
        _.each(groups[0], function(word) {
            Word.update({ type: word.type, term: word.term }, { $set: { score: word.score } }, function(err, numberaffected) {
                if (err) {
                    console.log('err', err);
                }
            });

        })
    });
});

// Get list of words
exports.index = function(req, res) {
    Word.find({}).sort({ score: -1 }).exec().then(function(words) {
        return res.json(200, words);
    });
};

// Get a single word
exports.show = function(req, res) {
    Word.findById(req.params.id, function(err, word) {
        if (err) {
            return handleError(res, err);
        }
        if (!word) {
            return res.send(404);
        }
        return res.json(word);
    });
};

// Creates a new word in the DB.
exports.create = function(req, res) {
    /*    console.log('req', req.body);
        console.log('req.params', req.params);
    */
    Word.remove({
        term: req.body.term
    }).exec().then(function() {
        Word.create(req.body, function(err, word) {
            if (err) {
                return handleError(res, err);
            }
            return res.json(201, word);
        });
    });
};

// Updates an existing word in the DB.
exports.update = function(req, res) {
    if (req.body._id) {
        delete req.body._id;
    }
    Word.findById(req.params.id, function(err, word) {
        if (err) {
            return handleError(res, err);
        }
        if (!word) {
            return res.send(404);
        }
        var updated = _.merge(word, req.body);
        updated.save(function(err) {
            if (err) {
                return handleError(res, err);
            }
            return res.json(200, word);
        });
    });
};

// Deletes a word from the DB.
exports.destroy = function(req, res) {
    Word.findById(req.params.id, function(err, word) {
        if (err) {
            return handleError(res, err);
        }
        if (!word) {
            return res.send(404);
        }
        word.remove(function(err) {
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

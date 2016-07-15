'use strict';
var auditLog = require('audit-log');
var config = require('../../config/environment');
auditLog.addTransport("mongoose", { connectionString: config.mongo.uri });
//auditLog.addTransport("console");
//  method is logEvent( actor, origin, action, label, object, description ) 

var request = require('request');
var getPage = require('summarizer').getPage;
var extractor = require('unfluff');
var gramophone = require('gramophone');
var read = require('node-readability');
var _ = require('lodash');
var async = require('async');
var ArticleAnalysis = require('./articleAnalysis.model');
var Article = require('../article/article.model');
var Thing = require('../thing/thing.model');
var Word = require('../word/word.model');
var Parser = require('../../NLTK/parser');
var allwords = [];

var articleAnalys = function(req, res) {
    Word.find(function(err, words) {
        if (err) {
            return handleError(res, err);
        }
        allwords = words;
    });

    var articleQuery = (req && req.query) ? req.query : {};

    Article.find(articleQuery,
        function(err, articles) {
            console.log('[-- Start Article Analysis');
            console.log(' -- ArticleToAnalyse : ', articles.length);
            async.map(articles, keywordAnalyse, function(err, words) {
                process.emit('CountArticles');
                process.emit('UpdateScoreWords');
                console.log('--] End Article Analysis');
            });
        });
};

process.on('AnalyseNewArticles', function(req) {
    articleAnalys(req, undefined);
});

process.on('CountArticles', function() {
    var articleQuery = { starred: true, read: false, type: 'Pro' };
    Article.find(articleQuery,
        function(err, articles) {
            Thing.update({ name: 'Articles' }, { $set: { 'available.pro': articles.length } }, function(err, results) {
                console.log('ArticleCount Pro Updated', articles.length);
            });
        });
    var articleQuery2 = { starred: true, read: false, type: 'Perso' };
    Article.find(articleQuery2,
        function(err, articles) {
            Thing.update({ name: 'Articles' }, { $set: { 'available.perso': articles.length } }, function(err, results) {
                console.log('ArticleCount Perso Updated', articles.length);
            });
        });
});

// articleAnalys toutes les heures
var timer = setInterval(function() {
    console.log('*** Article Analyse Automatic -- Simple 1 min');
    var req = {
        query: {
            score: {
                $exists: false
            }
        }
    };
    articleAnalys(req, undefined);
}, 60 * 1000);

articleAnalys({
    query: {
        score: {
            $exists: false
        }
    }
}, undefined);

// articleAnalys toutes les heures
var timer = setInterval(function() {
        console.log('*** Article Analyse Automatic -- Full 60 min');
        articleAnalys(undefined, undefined);
    },
    60 * 60 * 1000);

// Get list of articleAnalysiss
exports.index = articleAnalys;

function keywordAnalyse(article, callback) {
    getPage(article.link).then(function(data) {

        // fréquence des mots 
        var words = data.text;

        var wordArray = gramophone.extract(words, {
            score: true,
            limit: 100,
            html: true
        })

        //console.log('wordArray', wordArray);
        var query = {
            _id: article._id
        };
        var updatedArticle = {
            title: article.title,
            type: article.type,
            summary: article.summary || data.summary,
            softTitle: data.softTitle,
            image: data.image,
            videos: data.videos,
            keywords: data.keywords,
            text: data.text,
            tags: data.tags,
            lang: data.lang,
            canonicalLink: data.canonicalLink,
            author: data.author,
            topics: data.stats.topics,
            bigWords: wordArray,
            words: data.stats.words,
            sentiment: data.stats.sentiment,
            difficulty: data.stats.difficulty,
            minutes: data.stats.minutes
        };
        //console.log('updatedArticle', updatedArticle);
        updatedArticle = calculateScoreArticle(updatedArticle);

        read(article.link, function(err, articleReadable, meta) {
            //console.log('updatedArticle', updatedArticle.title);
            updatedArticle.text = (articleReadable && articleReadable.content.length > 0) ? articleReadable.content : data.text;
            Article.findOneAndUpdate(query, updatedArticle).exec().then(function(article) {
                process.emit('CountArticles');
                process.emit('UpdateWords', article);
                callback(null, article);
            });
        });


    }, function(error) { // error
        console.log('article.link', article.link);
        console.log('error', error);
        callback(null, article);
    });
}

function calculateScoreArticle(updatedArticle) {
    var score = 0;

    //console.log('********** topics');
    updatedArticle.topics = _.remove(_.map(updatedArticle.topics, function(topic, key) {
        var parsedTopic = Parser.parseMessage(topic);

        if (parsedTopic.length > 0) {
            return {
                term: parsedTopic[0].stem,
                word: parsedTopic[0].word,
                count: 5
            };
        }
    }), undefined);
    //console.log('********** bigWords');
    updatedArticle.bigWords = _.remove(_.map(updatedArticle.bigWords, function(bigWord, key) {
        var parsedbigWord = Parser.parseMessage(bigWord.term);
        if (parsedbigWord.length > 0) {
            return {
                term: parsedbigWord[0].stem,
                word: parsedbigWord[0].word,
                count: 5
            };
        }
    }), undefined);

    //console.log('********** tags');
    updatedArticle.tags = _.remove(_.map(updatedArticle.tags, function(tag, key) {
        var parsedtag = Parser.parseMessage(tag);

        if (parsedtag.length > 0) {
            return {
                term: parsedtag[0].stem,
                word: parsedtag[0].word,
                count: 5
            };
        }
    }), undefined);

    //console.log('********** keywords');
    updatedArticle.keywords = _.remove(_.map(updatedArticle.keywords, function(keyword, key) {
        var parsedkeyword = Parser.parseMessage(keyword);

        if (parsedkeyword.length > 0) {
            return {
                term: parsedkeyword[0].stem,
                word: parsedkeyword[0].word,
                count: 5
            };
        }
    }), undefined);

    console.log('********** Analyse : ', updatedArticle.title);
    var wordsinTitle = _.remove(_.map(updatedArticle.title.split(' '), function(wordintitle, key) {
        var parsedwordintitle = Parser.parseMessage(wordintitle);

        if (parsedwordintitle.length > 0) {
            return {
                term: parsedwordintitle[0].stem,
                word: parsedwordintitle[0].word,
                count: 5
            };
        }
    }), undefined);

    //console.log('********** terms');
    var terms = updatedArticle.topics.concat(updatedArticle.bigWords).concat(updatedArticle.keywords).concat(updatedArticle.tags).concat(updatedArticle.topics).concat(wordsinTitle);

    // on regroupe par mot clé
    var groups = _(terms).groupBy('term');
    var groupWords = _(groups).map(function(g, key) {
            return {
                term: key,
                word: _(g).reduce(function(m, x) {
                    return m + ' ' + x.word;
                }, '').trim(),
                count: _(g).reduce(function(m, x) {
                    return m + x.count;
                }, 0),
                score: _(g).reduce(function(m, x) {
                    var thisword = _.filter(allwords, function(word) {
                        return word.term === x.term && word.type === updatedArticle.type;
                    })
                    return (thisword.length > 0) ? m + (x.count * (thisword[0].like || 0)) : m;
                }, 0)
            };
        })
        .value();

    groupWords = _.sortBy(groupWords, function(o) {
        return [-o.score, -o.count];
    });
    updatedArticle.terms = groupWords;
    delete updatedArticle.bigWords;
    delete updatedArticle.keywords;
    delete updatedArticle.tags;
    delete updatedArticle.topics;

    score = _.reduce(groupWords, function(m, x) {
        return m + parseInt(x.score);
    }, 0);
    updatedArticle.score = score;
    updatedArticle.starred = (updatedArticle.score > 19) ? true : false;
    return updatedArticle;
}

// Get a single articleAnalysis
exports.show = function(req, res) {
    ArticleAnalysis.findById(req.params.id, function(err, articleAnalysis) {
        if (err) {
            return handleError(res, err);
        }
        if (!articleAnalysis) {
            return res.send(404);
        }
        return res.json(articleAnalysis);
    });
};

// Creates a new articleAnalysis in the DB.
exports.create = function(req, res) {
    ArticleAnalysis.create(req.body, function(err, articleAnalysis) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(201, articleAnalysis);
    });
};

// Updates an existing articleAnalysis in the DB.
exports.update = function(req, res) {
    if (req.body._id) {
        delete req.body._id;
    }
    ArticleAnalysis.findById(req.params.id, function(err, articleAnalysis) {
        if (err) {
            return handleError(res, err);
        }
        if (!articleAnalysis) {
            return res.send(404);
        }
        var updated = _.merge(articleAnalysis, req.body);
        updated.save(function(err) {
            if (err) {
                return handleError(res, err);
            }
            return res.json(200, articleAnalysis);
        });
    });
};

// Deletes a articleAnalysis from the DB.
exports.destroy = function(req, res) {
    ArticleAnalysis.findById(req.params.id, function(err, articleAnalysis) {
        if (err) {
            return handleError(res, err);
        }
        if (!articleAnalysis) {
            return res.send(404);
        }
        articleAnalysis.remove(function(err) {
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

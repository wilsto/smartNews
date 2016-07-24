/**
 * Main application routes
 */

'use strict';

var errors = require('./components/errors');

module.exports = function(app) {

    // Insert routes below
    app.use('/api/rules', require('./api/rule'));
    app.use('/api/twitterrules', require('./api/twitterrule'));
    app.use('/api/tweets', require('./api/tweet'));
    app.use('/api/interests', require('./api/interest'));
    app.use('/api/words', require('./api/word'));
    app.use('/api/articleAnalysiss', require('./api/articleAnalysis'));
    app.use('/api/articles', require('./api/article'));
    app.use('/api/feeds', require('./api/feed'));
    app.use('/api/rssparsers', require('./api/rssparser'));
    app.use('/api/things', require('./api/thing'));
    app.use('/api/logs', require('./api/log'));
    app.use('/api/users', require('./api/user'));

    app.use('/auth', require('./auth'));

    // All undefined asset or api routes should return a 404
    app.route('/:url(api|auth|components|app|bower_components|assets)/*')
        .get(errors[404]);

    // All other routes should redirect to the index.html
    app.route('/*')
        .get(function(req, res) {
            res.sendfile(app.get('appPath') + '/index.html');
        });
};

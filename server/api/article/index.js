'use strict';

var express = require('express');
var controller = require('./article.controller');

var router = express.Router();

router.get('/', controller.getArticles);
router.get('/unread', controller.getUnreadArticles);
router.get('/read', controller.getReadArticles);
router.get('/starred', controller.getStarredArticles);
router.get('/starredunread', controller.getStarredUnreadArticles);
router.get('/starredread', controller.getStarredReadArticles);
router.post('/:id', controller.updateArticle);



module.exports = router;
'use strict';

var express = require('express');
var controller = require('./feed.controller');

var router = express.Router();
router.get('/', controller.getFeeds);
router.get('/refresh/:id', controller.refreshOneFeed);
router.get('/refresh', controller.refreshFeeds);
router.get('/:id', controller.getFeed);
router.post('/', controller.addFeed);
router.post('/:id', controller.updateFeed);
router.patch('/:id', controller.updateFeed);
router.delete('/:id', controller.delFeed);

module.exports = router;

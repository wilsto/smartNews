'use strict';

var express = require('express');
var controller = require('./article.controller');

var router = express.Router();

router.get('/', controller.getArticles);
router.get('/count', controller.countArticles);
router.post('/:id', controller.updateArticle);



module.exports = router;

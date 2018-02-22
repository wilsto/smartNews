'use strict';

var express = require('express');
var controller = require('./book.controller');

var router = express.Router();

router.get('/', controller.getBooks);
router.get('/count', controller.countBooks);
router.post('/:id', controller.updateBook);



module.exports = router;

'use strict';

const express = require('express');
const aboutRouter = express.Router();

aboutRouter.get('/', (req, res, next) => {
  res.render('about');
});

module.exports = aboutRouter;

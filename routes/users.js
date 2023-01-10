const express = require('express');
const User = require('../models/user');
const Comment = require('../models/comment');
const routeGuardMiddleware = require('../middleware/route-guard');
const Recipe = require('../models/recipe');

const usersRouter = express.Router();

usersRouter.get('/', (req, res, next) => {
  let recipe;
  let comment;
  Recipe.find()
    .then((document) => {
      recipe = document;
      return Comment.find();
    })
    .then((comments) => {
      comment = comments;
      return User.find();
    })
    .then((users) => {
      res.render('users', { recipe, comment, users });
    })
    .catch((error) => {
      next(error);
    });
});

module.exports = usersRouter;

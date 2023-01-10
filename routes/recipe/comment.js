const express = require('express');
const Recipe = require('./../../models/recipe');
const Comment = require('./../../models/comment');
const routeGuardMiddleware = require('../../middleware/route-guard');
const commentRouter = express.Router();

commentRouter.post(
  '/:id/comment/delete/:commentId',
  routeGuardMiddleware,
  (req, res, next) => {
    const { id } = req.params;
    const { commentId } = req.params;
    Comment.findByIdAndDelete(commentId)
      .then(() => {
        res.redirect(`/recipe/${id}`);
      })
      .catch((error) => {
        next(error);
      });
  }
);
commentRouter.post('/:id/comment', routeGuardMiddleware, (req, res, next) => {
  const { comment } = req.body;
  const { id } = req.params;
  let recipe;
  Recipe.findById(id)
    .then((document) => {
      recipe = document;
      return Comment.create({
        comment,
        creator: req.user._id,
        refRecipe: recipe._id
      });
    })
    .then(() => {
      res.redirect(`/recipe/${id}`);
    })
    .catch((error) => {
      next(error);
    });
});

module.exports = commentRouter;

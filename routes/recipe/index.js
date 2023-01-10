const express = require('express');
const Recipe = require('../../models/recipe');
const Comment = require('../../models/comment');
const recipeRouter = express.Router();
const Relation = require('../../models/relation');

recipeRouter.get('/:id', (req, res, next) => {
  const { id } = req.params;
  let comment;
  let recipes;
  let ratings;
  let ingredient;
  let ownComment;
  let ownRecipe;

  Recipe.findById(id)
    .then((find) => {
      return Comment.find({ refRecipe: find._id }).populate('creator');
    })
    .then((comments) => {
      comments.forEach((eachComment) => {
        ownComment =
          req.user && String(req.user._id) === String(eachComment.creator._id);
        eachComment.ownComment = ownComment;
      });
      comment = comments;
      return Recipe.findById(id);
    })
    .then((document) => {
      recipes = document;
      ingredient = document.ingredients;
      if (req.user) {
        return Relation.findOne({
          refRecipe: recipes._id,
          creator: req.user._id
        });
      }
    })
    .then((vote) => {
      if (req.user) {
        if (vote) {
          ratings = req.user && String(req.user._id) === String(vote.creator);
        } else {
          ratings = false;
        }
      }
      return Recipe.findById(id);
    })
    .then((recipe) => {
      if (req.user) {
        ownRecipe = req.user && String(req.user._id) === String(recipe.creator);
      }
      console.log(recipe);
      res.render('recipe-detail', {
        ratings,
        ingredient,
        recipe,
        ownRecipe,
        comment
      });
    })
    .catch((error) => {
      next(error);
    });
});

module.exports = recipeRouter;

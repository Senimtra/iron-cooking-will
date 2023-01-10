const express = require('express');
const Recipe = require('../../models/recipe');
const Relation = require('../../models/relation');
const routeGuardMiddleware = require('../../middleware/route-guard');
const recipeRouter = express.Router();

recipeRouter.post('/:id/vote', routeGuardMiddleware, (req, res, next) => {
  const { id } = req.params;
  let recipe;
  Recipe.findById(id)
    .then((document) => {
      recipe = document;
      return Relation.findOne({
        refRecipe: recipe._id,
        creator: req.user._id
      });
    })
    .then((vote) => {
      console.log(vote);
      if (!vote) {
        return Relation.create({
          refRecipe: recipe._id,
          creator: req.user._id
        }).then(() => {
          return Recipe.findByIdAndUpdate(id, { $inc: { ratings: 1 } });
        });
      } else {
        return Relation.findByIdAndDelete(vote._id).then(() => {
          return Recipe.findByIdAndUpdate(id, { $inc: { ratings: -1 } }).then(
            (update) => {
              if (update.ratings < 0) {
                return Recipe.findByIdAndUpdate(id, { ratings: 0 });
              } else {
                return Recipe.findById(id);
              }
            }
          );
        });
      }
    })
    .then((recipes) => {
      res.redirect(`/recipe/${recipes._id}`);
    })
    .catch((error) => {
      next(error);
    });
});

module.exports = recipeRouter;

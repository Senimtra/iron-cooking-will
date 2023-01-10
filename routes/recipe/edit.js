const express = require('express');
const Recipe = require('../../models/recipe');
const upload = require('../../middleware/file-upload');
const routeGuardMiddleware = require('../../middleware/route-guard');
const recipeRouter = express.Router();

recipeRouter.get('/:id/edit', routeGuardMiddleware, (req, res, next) => {
  const { id } = req.params;
  let recipes;
  Recipe.find()
    .then((all) => {
      recipes = all;
      return Recipe.findById(id);
    })
    .then((recipe) => {
      res.render('recipe-edit', {
        recipes,
        recipe
      });
    })
    .catch((error) => {
      next(error);
    });
});

recipeRouter.post(
  '/:id/edit',
  routeGuardMiddleware,
  upload.single('picture'),
  (req, res, next) => {
    const { id } = req.params;
    let picture;
    const {
      title,
      level,
      cookingTime,
      servings,
      diet,
      cuisine,
      dishType,
      ingredients,
      instructions
    } = req.body;
    if (req.file) {
      picture = req.file.path;
    }
    Recipe.findByIdAndUpdate(id, {
      title,
      level,
      cookingTime,
      servings,
      diet,
      cuisine,
      dishType,
      ingredients,
      instructions,
      picture,
      creator: req.user._id
    })
      .then((recipe) => {
        res.redirect(`/recipe/${recipe._id}`);
      })
      .catch((error) => {
        next(error);
      });
  }
);

module.exports = recipeRouter;

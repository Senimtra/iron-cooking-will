const express = require('express');
const Recipe = require('../../models/recipe');
const upload = require('../../middleware/file-upload');
const routeGuardMiddleware = require('../../middleware/route-guard');
const recipeRouter = express.Router();

recipeRouter.get('/create', routeGuardMiddleware, (req, res, next) => {
  Recipe.find()
    .then((recipes) => {
      res.render('recipe-create', { recipes });
    })
    .catch((error) => {
      next(error);
    });
});

recipeRouter.post(
  '/create',
  routeGuardMiddleware,
  upload.single('picture'),
  (req, res, next) => {
    const {
      title,
      cookingTime,
      servings,
      level,
      diet,
      cuisine,
      dishType,
      ingredients,
      instructions
    } = req.body;
    const picture = req.file.path;
    Recipe.create({
      title,
      cookingTime,
      servings,
      level,
      diet,
      cuisine,
      dishType,
      ingredients,
      instructions,
      picture,
      creator: req.user._id,
      ratings: 0
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

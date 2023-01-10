const express = require('express');
const Recipe = require('../../models/recipe');
const routeGuardMiddleware = require('../../middleware/route-guard');
const recipeRouter = express.Router();

recipeRouter.post('/:id/delete', routeGuardMiddleware, (req, res, next) => {
  const { id } = req.params;
  Recipe.findByIdAndDelete(id)
    .then(() => {
      res.redirect('/');
    })
    .catch((error) => {
      next(error);
    });
});

module.exports = recipeRouter;

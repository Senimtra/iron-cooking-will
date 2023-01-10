const express = require('express');
const Recipe = require('../models/recipe');
const Contact = require('../models/contact');
const upload = require('../middleware/file-upload');
const nodemailer = require('nodemailer');
const Comment = require('../models/comment');
const Relation = require('../models/relation');

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD
  }
});

const routeGuardMiddleware = require('../middleware/route-guard');
const recipeRouter = express.Router();

recipeRouter.get('/create', routeGuardMiddleware, (req, res, next) => {
  Recipe.find().then((recipes) => {
    res.render('recipe-create', { recipes });
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

recipeRouter.post('/:id/comment', (req, res, next) => {
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

recipeRouter.get('/:id', (req, res, next) => {
  const { id } = req.params;
  let ingredient;
  let comment;
  Comment.find()
    .then((comments) => {
      comment = comments;
      return Recipe.findById(id);
    })
    .then((document) => {
      console.log(document);
      ingredient = document.ingredients;
      return Recipe.findById(id);
    })
    .then((recipe) => {
      const ownRecipe =
        req.user && String(req.user._id) === String(recipe.creator);

      res.render('recipe-detail', {
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

recipeRouter.post('/:id/send', (req, res, next) => {
  const { id } = req.params;
  const { name, email, subject, message } = req.body;
  Contact.create({
    name,
    email,
    subject,
    message
  })
    .then(() => {
      return Recipe.findById(id);
    })
    .then((recipe) => {
      transporter.sendMail({
        to: email,
        sender: 'ironhacknodetest@gmail.com',
        subject: subject,
        html: `<div style="text-align: center; width: 60%; margin: 0px auto;">
        <img src='https://res.cloudinary.com/dva9l2t1o/image/upload/h_100/v1632573577/ironhack_logo_jnmhiq.png'/>
        <h2>"${name}" would like you to see this recipe:</h2>
        <a style="font-size:16px" href='https://recipe-app0921.herokuapp.com/recipe/${id}' >${recipe.title}</a>
        <p style="font-size:16px">${message}</p>
        </div>`
      });
    })
    .then(() => {
      res.redirect('/confirmation');
    })
    .catch((error) => {
      next(error);
    });
});

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

recipeRouter.get('/:id', (req, res, next) => {
  const { id } = req.params;
  let recipes;
  let ratings;
  let ingredient;
  let comment;
  Comment.find()
    .then((comments) => {
      comment = comments;
      return Recipe.findById(id);
    })
    .then((document) => {
      recipes = document;
      ingredient = document.ingredients;
      return Relation.findOne({
        refRecipe: recipes._id,
        creator: req.user._id
      });
    })
    .then((vote) => {
      if (vote) {
        ratings = req.user && String(req.user._id) === String(vote.creator);
      } else {
        ratings = false;
      }
      return Recipe.findById(id);
    })
    .then((recipe) => {
      const ownRecipe =
        req.user && String(req.user._id) === String(recipe.creator);
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

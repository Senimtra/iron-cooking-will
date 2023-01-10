const express = require('express');
const User = require('./../models/user');
const routeGuardMiddleware = require('./../middleware/route-guard');
const upload = require('./../middleware/file-upload');
const Recipe = require('./../models/recipe');
const Comment = require('./../models/comment');
const Relation = require('../models/relation');

const profileRouter = express.Router();

profileRouter.get('/:id/edit', routeGuardMiddleware, (req, res, next) => {
  const { id } = req.params;
  User.findById(id)
    .then((profile) => {
      const ownProfile =
        req.user && String(req.user._id) === String(profile._id);
      res.render('profile-edit', {
        profile,
        ownProfile
      });
    })
    .catch((error) => {
      next(error);
    });
});

profileRouter.post(
  '/:id/edit',
  routeGuardMiddleware,
  upload.single('picture'),
  (req, res, next) => {
    const { username, email, password } = req.body;
    const id = req.user._id;
    let picture;
    if (req.file) {
      picture = req.file.path;
    }
    User.findByIdAndUpdate(id, {
      username,
      email,
      password,
      picture
    })
      .then((user) => {
        res.redirect(`/profile/${user._id}`);
      })
      .catch((error) => {
        next(error);
      });
  }
);

profileRouter.post('/:id/delete', routeGuardMiddleware, (req, res, next) => {
  const { id } = req.params;
  User.findById(id)
    .then((user) => {
      return Recipe.deleteMany({ creator: user._id });
    })
    .then(() => {
      return Comment.deleteMany({ creator: req.user._id });
    })
    .then(() => {
      return Relation.deleteMany({ creator: req.user._id });
    })
    .then(() => {
      return User.findByIdAndDelete(id);
    })
    .then(() => {
      req.session.destroy();
      res.redirect('/');
    });
});

profileRouter.get('/:id', (req, res, next) => {
  const { id } = req.params;
  let profile;
  User.findById(id)
    .then((document) => {
      profile = document;
      return Recipe.find({ creator: id })
        .sort({ publishingDate: -1 })
        .populate('creator', 'username picture');
    })
    .then((recipe) => {
      const ownProfile =
        req.user && String(req.user._id) === String(profile._id);
      res.render('profile', {
        profile,
        recipe,
        ownProfile
      });
    })
    .catch((error) => {
      next(error);
    });
});

module.exports = profileRouter;

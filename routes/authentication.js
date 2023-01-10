'use strict';

const { Router } = require('express');

const bcryptjs = require('bcryptjs');
const User = require('./../models/user');
const upload = require('../middleware/file-upload');

const authenticationRouter = new Router();

authenticationRouter.get('/sign-up', (req, res, next) => {
  res.render('sign-up');
});

authenticationRouter.post(
  '/sign-up',
  upload.single('picture'),
  (req, res, next) => {
    const { username, email, password } = req.body;
    let picture;
    if (req.file) {
      picture = req.file.path;
    }
    bcryptjs
      .hash(password, 10)
      .then((hash) => {
        return User.create({
          username,
          email,
          picture,
          passwordHashAndSalt: hash
        });
      })
      .then((user) => {
        req.session.userId = user._id;
        res.redirect(`/profile/${user._id}`);
      })
      .catch((error) => {
        next(error);
      });
  }
);

authenticationRouter.get('/sign-in', (req, res, next) => {
  res.render('sign-in');
});

authenticationRouter.post('/sign-in', (req, res, next) => {
  let user;
  const { email, password } = req.body;
  User.findOne({ email })
    .then((document) => {
      if (!document) {
        return Promise.reject(new Error("There's no user with that email."));
      } else {
        user = document;
        return bcryptjs.compare(password, user.passwordHashAndSalt);
      }
    })
    .then((result) => {
      if (result) {
        req.session.userId = user._id;
        res.redirect(`/profile/${user._id}`);
      } else {
        return Promise.reject(new Error('Wrong password.'));
      }
    })
    .catch((error) => {
      next(error);
    });
});

authenticationRouter.post('/sign-out', (req, res, next) => {
  req.session.destroy();
  res.redirect('/');
});

module.exports = authenticationRouter;

'use strict';

// ### Require express modules ###
const path = require('path');
const express = require('express');
const createError = require('http-errors');
const connectMongo = require('connect-mongo');
const expressSession = require('express-session');
const logger = require('morgan');
const sassMiddleware = require('node-sass-middleware');
const serveFavicon = require('serve-favicon');
const basicAuthenticationDeserializer = require('./middleware/basic-authentication-deserializer.js');
const bindUserToViewLocals = require('./middleware/bind-user-to-view-locals.js');
const baseRouter = require('./routes/index');
const authenticationRouter = require('./routes/authentication');
const profileRouter = require('./routes/profile');
const usersRouter = require('./routes/users');
const commentRouter = require('./routes/recipe/comment');
const recipeCreateRouter = require('./routes/recipe/create');
const recipeDeleteRouter = require('./routes/recipe/delete');
const recipeEditRouter = require('./routes/recipe/edit');
const recipeIndexRouter = require('./routes/recipe/index');
const recipeMailRouter = require('./routes/recipe/mail');
const recipeRatingsRouter = require('./routes/recipe/ratings');
const contactRouter = require('./routes/contact');
const aboutRouter = require('./routes/about');

const hbs = require('hbs');

const app = express();

// const User = require('./models/user');
// const Recipe = require('./models/recipe');
// const Comment = require('./models/comment');
// const Relation = require('./models/relation');

// ### Register partials ###
hbs.registerPartials(path.join(__dirname, 'views/partials'));

// ### Register helper-date ###
hbs.registerHelper('date', (value) => {
  return `${value.toLocaleDateString()}`;
});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(serveFavicon(path.join(__dirname, 'public/images', 'favicon.ico')));
app.use(
  sassMiddleware({
    src: path.join('styles'),
    dest: path.join(__dirname, 'public/styles'),
    prefix: '/styles',
    outputStyle:
      process.env.NODE_ENV === 'development' ? 'expanded' : 'compressed',
    force: process.env.NODE_ENV === 'development',
    sourceMap: process.env.NODE_ENV === 'development'
  })
);
app.use(express.static(path.join(__dirname, 'public')));
app.use(logger('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(
  expressSession({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: false,
    cookie: {
      maxAge: 15 * 24 * 60 * 60 * 1000,
      httpOnly: true
    },
    store: connectMongo.create({
      mongoUrl: process.env.MONGODB_URI,
      ttl: 60 * 60
    })
  })
);
app.use(basicAuthenticationDeserializer);
app.use(bindUserToViewLocals);

app.use('/', baseRouter);
app.use('/authentication', authenticationRouter);
app.use('/profile', profileRouter);
app.use('/users', usersRouter);
app.use('/recipe', commentRouter);
app.use('/recipe', recipeCreateRouter);
app.use('/recipe', recipeDeleteRouter);
app.use('/recipe', recipeEditRouter);
app.use('/recipe', recipeIndexRouter);
app.use('/recipe', recipeMailRouter);
app.use('/recipe', recipeRatingsRouter);
app.use('/contact', contactRouter);
app.use('/about', aboutRouter);

// Catch missing routes and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// Catch all error handler
app.use((error, req, res, next) => {
  // Set error information, with stack only available in development
  res.locals.message = error.message;
  res.locals.error = req.app.get('env') === 'development' ? error : {};
  res.status(error.status || 500);
  res.render('error');
});

module.exports = app;

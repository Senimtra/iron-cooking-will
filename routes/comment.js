// 'use strict';

// const express = require('express');
// const Comment = require('./../models/comment');
// const commentRouter = express.Router();

// commentRouter.post('/', (req, res, next) => {
//   const { comment } = req.body;
//   let recipe;
//   Comment.create({
//     comment,
//     creator: req.user._id
//   })
//     .then(() => {
//       res.redirect('/recipe-detail');
//     })
//     .catch((error) => {
//       next(error);
//     });
// });

// module.exports = commentRouter;

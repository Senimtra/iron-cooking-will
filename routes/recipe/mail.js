const express = require('express');
const Recipe = require('../../models/recipe');
const recipeRouter = express.Router();
const Contact = require('../../models/contact');
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD
  }
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

module.exports = recipeRouter;

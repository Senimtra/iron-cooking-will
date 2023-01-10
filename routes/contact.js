'use strict';

const { Router } = require('express');
//const upload = require('../middleware/file-upload');
const nodemailer = require('nodemailer');
const Contact = require('./../models/contact');

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD
  }
});

const contactRouter = new Router();

contactRouter.get('/', (req, res, next) => {
  res.render('contact');
});

contactRouter.post('/', (req, res, next) => {
  const { name, email, subject, message } = req.body;
  Contact.create({
    name,
    email,
    subject,
    message
  })
    .then(() => {
      transporter.sendMail({
        to: 'ironhacknodetest@gmail.com',
        sender: email,
        replyTo: email,
        subject: subject,
        html: `<div>
        <h3>You received a message from "${name}"</h3>
        <p style="font-size:13px">${email}</p>
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

module.exports = contactRouter;

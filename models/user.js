'use strict';

const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      unique: true
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true
    },

    picture: {
      type: String
    },

    passwordHashAndSalt: {
      type: String,
      required: true,
      minlength: 5
    }
  },
  {
    timestamps: true
  }
);

const User = mongoose.model('User', userSchema);

userSchema.plugin(uniqueValidator, {
  message:
    'This Email or Username has already been used. Please choose a different one.'
});

module.exports = User;

// ref: own recipes

// ref: own comments

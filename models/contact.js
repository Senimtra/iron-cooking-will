const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String
    },
    email: {
      type: String,
      required: true,
      lowercase: true
    },
    subject: {
      type: String,
      minlength: 3,
      maxlength: 300
    },
    message: {
      type: String,
      required: true,
      minlength: 3
    }
  },
  { timestamps: true }
);

const Contact = mongoose.model('Contact', contactSchema);

module.exports = Contact;

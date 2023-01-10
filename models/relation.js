const mongoose = require('mongoose');

const relationSchema = new mongoose.Schema({
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  refRecipe: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipe'
  }
});

const Relation = mongoose.model('Relation', relationSchema);

module.exports = Relation;

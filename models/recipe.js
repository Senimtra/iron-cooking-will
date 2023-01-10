const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 300
    },

    level: {
      type: String,
      enum: ['Easy', 'Intermediate', 'Advanced']
    },

    cookingTime: {
      type: Number,
      min: 1
    },

    servings: {
      type: Number,
      min: 1
    },

    diet: {
      type: [String],
      enum: ['Vegetarian', 'Omnivore', 'Vegan', 'Pescatarian']
    },

    cuisine: {
      type: [String],
      enum: ['Asian', 'European', 'American', 'African']
    },

    dishType: {
      type: [String],
      enum: [
        'Appetizers & Starters',
        'Meat dishes',
        'Soups & Stews',
        'Pasta & Noodles',
        'Salads',
        'Burgers',
        'Beans, Grains & Legumes',
        'Casseroles & Gratins',
        'Desserts',
        'Pizzas',
        'Baked Goods'
      ]
    },

    ingredients: {
      type: [String]
    },

    instructions: {
      type: [String]
    },

    creator: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },

    picture: {
      type: String
    },

    ratings: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  { timestamps: true }
);

const Recipe = mongoose.model('Recipe', recipeSchema);

module.exports = Recipe;

/* eslint-disable prefer-arrow-callback */
'use strict';

const express = require('express');
const Recipe = require('../models/recipe');
const routeGuardMiddleware = require('../middleware/route-guard');
const upload = require('../middleware/file-upload');
const router = express.Router();

const LocalStorage = require('node-localstorage').LocalStorage;
const localStorage = new LocalStorage('./localstorage');

// #########################
// ##  Edamam Recipe API  ##
// #########################

const { RecipeSearchClient } = require('edamam-api');

const client = new RecipeSearchClient({
  appId: process.env.APP_ID,
  appKey: process.env.API_KEY
});

// ### GET confirmation route ###
router.get('/confirmation', (req, res) => {
  res.render('confirmation');
});

// ### GET root route ###
router.get('/', (req, res, next) => {
  let sortString, sortDirection, filterString, pageButtons, recipeCount;
  const { sort, filter } = req.query;
  // Set database sort string and direction
  if (sort === undefined) {
    sortString = 'ratings';
    sortDirection = -1;
  } else {
    sortString = Object.keys(getSortString(sort))[0];
    sortDirection = Object.values(getSortString(sort))[0];
  }
  // Set database filter string
  if (filter === undefined || filter === 'All recipes') {
    filterString = {};
  } else {
    filterString = getFilterString(filter);
  }
  Recipe.find(filterString)
    // Get recipes total
    .then((count) => {
      recipeCount = count.length;
      // Create paging buttons array for hbs
      pageButtons = [...Array(Math.ceil(recipeCount / 12)).keys()].map(
        (el) => el + 1
      );
    })
    // Get first page recipes
    .then(() => {
      return Recipe.find(filterString)
        .sort({ [sortString]: sortDirection })
        .limit(12)
        .populate('creator', 'username picture');
    })
    .then((recipes) => {
      // Create recipe range string for hbs
      const range = `1 - ${recipes.length}`;
      // Pass Recipes, Recipe total, Page button array, Recipe range, Sort value, Filter value
      res.render('home', {
        recipes,
        recipeCount,
        pageButtons,
        range,
        sort,
        filter
      });
    })
    .catch((error) => {
      next(error);
    });
});

// ### GET page route ###
router.get('/page/:page', (req, res, next) => {
  let sortString,
    sortDirection,
    filterString,
    pageButtons,
    recipeCount,
    skipCount;
  const { sort, filter } = req.query;
  const page = Number(req.params.page);
  // Set database sort string and direction
  if (sort === undefined) {
    sortString = 'ratings';
    sortDirection = -1;
  } else {
    sortString = Object.keys(getSortString(sort))[0];
    sortDirection = Object.values(getSortString(sort))[0];
  }
  // Set database filter string
  if (filter === undefined || filter === 'All recipes') {
    filterString = {};
  } else {
    filterString = getFilterString(filter);
  }
  Recipe.find(filterString)
    // Get recipes total
    .then((count) => {
      recipeCount = count.length;
      // Create page button array
      pageButtons = [...Array(Math.ceil(recipeCount / 12)).keys()].map(
        (el) => el + 1
      );
    })
    // Get recipes according to page
    .then(() => {
      skipCount = (page - 1) * 12;
      return Recipe.find(filterString)
        .sort({ [sortString]: sortDirection })
        .skip(skipCount)
        .limit(12)
        .populate('creator', 'username picture');
    })
    .then((recipes) => {
      // Create recipe range string for hbs
      const range = `${skipCount + 1} - ${skipCount + recipes.length} `;
      // Pass Recipes, Recipe total, Page button array, Recipe range, Sort value, Filter value
      res.render('home', {
        recipes,
        recipeCount,
        pageButtons,
        range,
        sort,
        filter
      });
    })
    .catch((error) => {
      next(error);
    });
});

// ### GET API search route ###
router.get('/api-search', (req, res, next) => {
  if (req.query.searchRecipe) {
    const { searchRecipe } = req.query;
    const sort = 'Ingredients ▼';
    client
      // Search api by hero search field
      .search({ query: searchRecipe, limit: { from: 0, to: 100 } })
      .then((query) => {
        let recipes_api = query.hits;
        // Create paging buttons array for hbs
        const recipeCount = recipes_api.length;
        const pageButtons = [...Array(Math.ceil(recipeCount / 20)).keys()].map(
          (el) => el + 1
        );
        // Sort array cooking Time ascending
        getSortedArray(recipes_api, sort);
        // Save stringified query result to localstorage
        if (localStorage.getItem('recipe') !== null) {
          localStorage.removeItem('recipe');
        }
        localStorage.setItem('recipes', JSON.stringify(recipes_api));
        // Create recipe range string for hbs
        const range = `1 - ${recipeCount > 19 ? 20 : recipeCount}`;
        // Get first page recipes
        recipes_api = recipes_api.slice(0, 20);
        // Pass all hits to the view
        res.render('home', { recipes_api, recipeCount, pageButtons, range });
      })
      .catch((error) => {
        next(error);
      });
  } else {
    const { sort } = req.query;
    // Get the stringified array from localstore
    const recipes = JSON.parse(localStorage.getItem('recipes'));
    // Sort the array depending by option value
    getSortedArray(recipes, sort);
    // Save stringified query result to localstorage
    localStorage.removeItem('recipe');
    localStorage.setItem('recipes', JSON.stringify(recipes));
    // Create paging buttons array for hbs
    const recipeCount = recipes.length;
    const pageButtons = [...Array(Math.ceil(recipeCount / 20)).keys()].map(
      (el) => el + 1
    );
    // Create recipe range string for hbs
    const range = `1 - ${recipeCount > 19 ? 20 : recipeCount}`;
    // Get first page recipes
    const recipes_api = recipes.slice(0, 20);
    // Pass all hits to the view
    res.render('home', { recipes_api, recipeCount, pageButtons, range, sort });
  }
});

// ### GET API page route ###
router.get('/api-page/:page', (req, res, next) => {
  const { sort } = req.query;
  const page = Number(req.params.page);
  // Getting the recipes from localstorage
  const recipes = JSON.parse(localStorage.getItem('recipes'));
  // Sort the array depending by option value
  getSortedArray(recipes, sort);
  // Get recipes according to page
  const skipCount = (page - 1) * 20;
  const recipes_api = recipes.slice(skipCount, skipCount + 20);
  // Create recipe range string for hbs
  const range = `${skipCount + 1} - ${skipCount + recipes_api.length} `;
  // Create paging buttons array for hbs
  const recipeCount = recipes.length;
  const pageButtons = [...Array(Math.ceil(recipeCount / 20)).keys()].map(
    (el) => el + 1
  );
  res.render('home', { recipes_api, pageButtons, range, sort });
});

// ### POST API add recipe route ###
router.post(
  '/api/add-recipe',
  routeGuardMiddleware,
  upload.single('picture'),
  (req, res, next) => {
    // Set up recipe object
    let level;
    let { cookingTime } = req.body;
    cookingTime = cookingTime < 1 ? 1 : cookingTime;
    req.body.level = getApiLevel(req.body.cookingTime);
    req.body.diet = getApiDiet(req.body.diet);
    req.body.cuisine = getApiCuisine(req.body.cuisine, req.body.title);
    req.body.dishType = getApiDishType(req.body.dishType, req.body.title);
    const {
      title,
      servings,
      diet,
      cuisine,
      dishType,
      ingredients,
      instructions,
      picture
    } = req.body;
    Recipe.create({
      title,
      cookingTime,
      servings,
      level,
      diet,
      cuisine,
      dishType,
      ingredients,
      instructions,
      picture,
      creator: req.user._id,
      ratings: 0
    })
      .then((recipe) => {
        res.redirect(`/recipe/${recipe._id}`);
      })
      .catch((error) => {
        next(error);
      });
  }
);

module.exports = router;

// #########################################
// ##  Get Sort-string from Select-value  ##
// #########################################

function getSortString(formValue) {
  const valueMap = {
    'Ratings ▼': { ratings: -1 },
    'Ratings ▲': { ratings: 1 },
    'Cooking Time ▼': { cookingTime: -1 },
    'Cooking Time ▲': { cookingTime: 1 },
    'Date added ▼': { createdAt: -1 },
    'Date added ▲': { createdAt: 1 }
  };
  for (const [key, value] of Object.entries(valueMap)) {
    if (key === formValue) return value;
  }
}

// ###########################################
// ##  Get Filter-string from Select-value  ##
// ###########################################

function getFilterString(formValue) {
  const valueMap = {
    Easy: { level: 'Easy' },
    Intermediate: { level: 'Intermediate' },
    Advanced: { level: 'Advanced' },
    Veggie: { diet: 'Vegetarian' },
    Omnivore: { diet: 'Omnivore' },
    Vegan: { diet: 'Vegan' },
    Pescatarian: { diet: 'Pescatarian' },
    Asian: { cuisine: 'Asian' },
    European: { cuisine: 'European' },
    American: { cuisine: 'American' },
    African: { cuisine: 'African' },
    'Appetizers & Starters': { dishType: 'Appetizers & Starters' },
    'Meat dishes': { dishType: 'Meat dishes' },
    'Soups & Stews': { dishType: 'Soups & Stews' },
    'Pasta & Noodles': { dishType: 'Pasta & Noodles' },
    Salads: { dishType: 'Salads' },
    Burgers: { dishType: 'Burgers' },
    'Grains & Legumes': { dishType: 'Beans, Grains & Legumes' },
    'Casseroles & Gratins': { dishType: 'Casseroles & Gratins' },
    Desserts: { dishType: 'Desserts' },
    Pizzas: { dishType: 'Pizzas' },
    'Baked Goods': { dishType: 'Baked Goods' }
  };
  for (const [key, value] of Object.entries(valueMap)) {
    if (key === formValue) return value;
  }
}

// ###########################
// ##  API Calculate level  ##
// ###########################

function getApiLevel(time) {
  return time <= 30 ? 'Easy' : time <= 90 ? 'Intermediate' : 'Advanced';
}

// ####################
// ##  API Get diet  ##
// ####################

function getApiDiet(dietString) {
  const dietArr = dietString.split(',');
  const result = dietArr.filter(
    (el) =>
      el.toLowerCase() === 'pescatarian' ||
      el.toLowerCase() === 'vegetarian' ||
      el.toLowerCase() === 'vegan'
  );
  return !result.length ? ['Omnivore'] : result;
}

// #######################
// ##  API Get cuisine  ##
// #######################

function getApiCuisine(cuisineString, title) {
  const asian = [
    'asian',
    'chinese',
    'indian',
    'japanese',
    'kosher',
    'south east asian',
    'middle eastern'
  ];
  const american = ['american', 'caribbean', 'mexican', 'south american'];
  const european = [
    'british',
    'central europe',
    'eastern europe',
    'french',
    'italian',
    'mediterranean',
    'nordic'
  ];
  if (title.includes('Africa') || title.includes('Morocc')) return ['African'];
  if (asian.includes(cuisineString)) return ['Asian'];
  if (american.includes(cuisineString)) return ['American'];
  if (european.includes(cuisineString)) return ['European'];
}

// #########################
// ##  API Get dish type  ##
// #########################

function getApiDishType(dishType, title) {
  const appetizersStarters = [
    'alcohol-cocktail',
    'starter',
    'cereals',
    'drinks',
    'condiments and sauces',
    'omelet',
    'sandwiches'
  ];
  const soupsStews = ['soup'];
  const salads = ['salad'];
  const beansGrainsLegumes = ['egg', 'preps', 'preserve'];
  const desserts = ['dessert', 'desserts', 'biscuits and cookies', 'pancake'];
  const bakedGoods = ['bread'];
  // Catchwords dish types
  const casserolesGratins = [
    'gratin',
    'gratins',
    'casserole',
    'cornbake',
    'potpie',
    'souffle'
  ];
  const burgers = ['cheeseburger', 'burger', 'burgers'];
  const pizzas = ['pizza', 'pizzas', 'pizzadillas', 'stromboli', 'pizzagna'];
  const pastaNoodles = [
    'pasta',
    'spaghetti',
    'fettuccine',
    'penne',
    'carbonara',
    'mostaccioli',
    'gnocchi',
    'orecchiette',
    'noodles',
    'lasagna',
    'ziti',
    'ravioli',
    'rigatoni',
    'bolognese',
    'papardelle',
    'bucatini'
  ];
  const meatDishes = [
    'chicken',
    'lamb',
    'meat',
    'steak',
    'turkey',
    'bacon',
    'kebab',
    'legs',
    'chop',
    'duck',
    'pork',
    'ribs',
    'fish',
    'prawn',
    'roast'
  ];
  if (
    title
      .split(' ')
      .map((el) => el.toLowerCase())
      .filter((el) => burgers.includes(el)).length
  )
    return ['Burgers'];
  if (
    title
      .split(' ')
      .map((el) => el.toLowerCase())
      .filter((el) => casserolesGratins.includes(el)).length
  )
    return ['Casseroles & Gratins'];
  if (
    title
      .split(' ')
      .map((el) => el.toLowerCase())
      .filter((el) => pizzas.includes(el)).length
  )
    return ['Pizzas'];
  if (
    title
      .split(' ')
      .map((el) => el.toLowerCase())
      .filter((el) => pastaNoodles.includes(el)).length
  )
    return ['Pasta & Noodles'];
  if (
    title
      .split(' ')
      .map((el) => el.toLowerCase())
      .filter((el) => meatDishes.includes(el)).length
  )
    return ['Meat dishes'];
  if (appetizersStarters.includes(dishType.split(',')[0]))
    return ['Appetizers & Starters'];
  if (soupsStews.includes(dishType.split(',')[0])) return ['Soups & Stews'];
  if (salads.includes(dishType.split(',')[0])) return ['Salads'];
  if (desserts.includes(dishType.split(',')[0])) return ['Desserts'];
  if (bakedGoods.includes(dishType.split(',')[0])) return ['Baked Goods'];
  if (beansGrainsLegumes.includes(dishType.split(',')[0]))
    return ['Beans, Grains & Legumes'];
  return ['Meat dishes'];
}

// ################################
// ##  SORT ARRAY BY SORTSTRING  ##
// ################################

const getSortedArray = (recipes, sortString) => {
  if (sortString === 'Cooking Time ▼') {
    recipes.sort((a, b) => {
      return b.recipe.totalTime - a.recipe.totalTime;
    });
  }
  if (sortString === 'Cooking Time ▲') {
    recipes.sort((a, b) => {
      return a.recipe.totalTime - b.recipe.totalTime;
    });
  }
  if (sortString === 'Calories ▼') {
    recipes.sort((a, b) => {
      return b.recipe.calories - a.recipe.calories;
    });
  }
  if (sortString === 'Calories ▲') {
    recipes.sort((a, b) => {
      return a.recipe.calories - b.recipe.calories;
    });
  }
  if (sortString === 'Ingredients ▼') {
    recipes.sort((a, b) => {
      return b.recipe.ingredientLines.length - a.recipe.ingredientLines.length;
    });
  }
  if (sortString === 'Ingredients ▲') {
    recipes.sort((a, b) => {
      return a.recipe.ingredientLines.length - b.recipe.ingredientLines.length;
    });
  }
};

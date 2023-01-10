window.addEventListener(
  'load',
  () => {
    console.log('Ironmaker app started successfully!');
  },
  false
);

// ########################################
// ##  KEEP WIN-POS ON SORT/FILTER/PAGE  ##
// ########################################

document.addEventListener('DOMContentLoaded', () => {
  const scrollpos = localStorage.getItem('scrollpos');
  if (scrollpos && document.querySelector('#sort-filter-pagination-form'))
    window.scrollTo({ top: scrollpos, left: 0, behavior: 'instant' });
});

window.onbeforeunload = () => {
  localStorage.setItem('scrollpos', window.scrollY);
};

// ##########################
// ##  RECIPE CREATE FORM  ##
// ##########################

// ### Set ingredient/instructions input field count ###
let ingredientCount = 1,
  instructionsCount = 1;
// ### Get DOM element nodes ###
const ingredientsContainerElement = document.getElementById(
  'ingredient-container'
);
const instructionsContainerElement = document.getElementById(
  'instructions-container'
);
const addIngredientButtonElement = document.getElementById('add-ingredient');
const removeIngredientButtonElement =
  document.getElementById('remove-ingredient');
const addInstructionButtonElement = document.getElementById('add-instruction');
const removeInstructionButtonElement =
  document.getElementById('remove-instruction');
// ### Add ingredient input field function ###
const addIngredient = () => {
  ingredientCount++;
  const newIngredientElement = document.createElement('input');
  document
    .getElementById('ingredient-container')
    .appendChild(newIngredientElement);
  newIngredientElement.setAttribute('class', 'input-ingredients');
  newIngredientElement.setAttribute('type', 'text');
  newIngredientElement.setAttribute('name', 'ingredients');
  newIngredientElement.setAttribute(
    'placeholder',
    `Ingredient ${ingredientCount}`
  );
};
// ### Remove ingredient input field function ###
const removeIngredient = () => {
  if (ingredientsContainerElement.childElementCount > 2) {
    ingredientCount--;
    ingredientsContainerElement.removeChild(
      ingredientsContainerElement.lastElementChild
    );
  }
};
// ### Add instruction input field function ###
const addInstruction = () => {
  instructionsCount++;
  const newInstructionElement = document.createElement('input');
  document
    .getElementById('instructions-container')
    .appendChild(newInstructionElement);
  newInstructionElement.setAttribute('class', 'input-instructions');
  newInstructionElement.setAttribute('type', 'text');
  newInstructionElement.setAttribute('name', 'instructions');
  newInstructionElement.setAttribute(
    'placeholder',
    `Preparation Step ${instructionsCount}`
  );
};
// ### Remove instruction input field function ###
const removeInstruction = () => {
  if (instructionsContainerElement.childElementCount > 2) {
    instructionsCount--;
    instructionsContainerElement.removeChild(
      instructionsContainerElement.lastElementChild
    );
  }
};
// ### Add button event listeners ###
if (addIngredientButtonElement) {
  addIngredientButtonElement.addEventListener('click', addIngredient);
  removeIngredientButtonElement.addEventListener('click', removeIngredient);
  addInstructionButtonElement.addEventListener('click', addInstruction);
  removeInstructionButtonElement.addEventListener('click', removeInstruction);
}

// ######################################
// ##  CHANGE PAGINATION BUTTON COLOR  ##
// ######################################

if (document.querySelector('#paging')) {
  // ### Get page number ###
  let page = Number(
    document.getElementById('recipe-count').innerText.split(' ')[0]
  );
  // ### Check if 12 (home) or 20 (api) recipes are shown
  if (document.querySelector('.btn-api') === null) {
    page = page === 0 ? 0 : (page - 1) / 12;
  } else {
    page = page === 0 ? 0 : (page - 1) / 20;
  }
  // ### Set css target depending on page ###
  const paginationButtonElements = document.getElementsByClassName('btn-page');
  paginationButtonElements[page].setAttribute(
    'class',
    'btn btn-sm btn-page active-page'
  );
}

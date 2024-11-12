const baseUrl = 'https://api.spoonacular.com/recipes/'
const apiKey = 'af37fbd907a041008b2a775fdfe5d271'

/* initializes favorites */
let favorites = JSON.parse(localStorage.getItem('favorites')) || []

/* need elements */
const nameInput = document.querySelector('.name-input')
const ingredientsInput = document.querySelector('.ingredients-input')
const suggestions = document.querySelector('.suggestions')
const recipesContainer = document.querySelector('.recipes-container')
const detailInfoContainer = document.querySelector('.detail-info-container')

/* listener for clicking in other place than detail section and closing it if */
document.addEventListener('mousedown', (event) => {
    var detailInfoContainer = document.querySelector('.detail-info-container')

    if (!detailInfoContainer.contains(event.target)) {
        hideDetailInfo()
    }
})

/* listener for enter key in name input and search if done */
nameInput.addEventListener('keydown', (event) => {
    if(event.key == 'Enter') search()
})

/* like in name input */
ingredientsInput.addEventListener('keydown', (event) => {
    if(event.key == 'Enter') search()
})

/* displaying suggestions when focusiing in name input */
nameInput.addEventListener('focus', () => {
    suggestions.style.display = 'block'
})

/* hiding it if not */
nameInput.addEventListener('blur', () => {
    setTimeout(() => {
        suggestions.innerHTML = ''
        suggestions.style.display = 'none'
    }, 150)
})

/* if length of value of name input is more than 3 then call suggestions show function */
nameInput.addEventListener('input', () => {
    if(nameInput.value.length >= 3) displayAutoComplete()
})

/* when window loaded initialize favorites in local storage if does not exist and call function for displaying favorites */
window.onload = async () => {
    !localStorage.getItem('favorites') ? localStorage.setItem('favorites', JSON.stringify([])) : 
    displayFavorites()
}

/* function for getting data from api with input values, cleaning list container and calling displayRecipe function for every item */
async function search() {
    let response = await fetch(`${baseUrl}complexSearch?apiKey=${apiKey}&number=20&includeIngredients=${ingredientsInput.value}&titleMatch=${nameInput.value}`)
    response = await response.json()
    let recipes = response.results
    recipesContainer.innerHTML = ''
    recipes.forEach(recipe => {
        displayRecipe(recipe)  
    })
}

/* function for getting detailed information by id for recipe and calling show detailed section function */
async function detailInfo(id){
    let response = await fetch(`${baseUrl}${id}/information?apiKey=${apiKey}&includeNutrition=true`)
    response = await response.json()
    displayDetailInfo( response)
}

/* adding or deleting from favorites and updating local storage */
function toggleToFavorites(recipe){
    const index = favoritesIndexOfRecipe(recipe)
    
    if (index === -1) {
        favorites.push(recipe);
    } else {
        favorites.splice(index, 1);
    }
    localStorage.setItem('favorites', JSON.stringify(favorites))
}

/* checking if favorites contain recipe */
function favoritesIncludeRecipe(recipe){
    return favorites.some(item => item.id === recipe.id)
}

/* getting index of recipe if it in favorites */
function favoritesIndexOfRecipe(recipe){
    return favorites.findIndex(item => item.id === recipe.id)
}

/* displaying favorites by sending favorite items one by one to display function and cleaning inputs and container for displaying recipes */
function displayFavorites(){
    nameInput.value = ''
    ingredientsInput.value = ''
    recipesContainer.innerHTML = ''
    favorites.forEach(item => {
        displayRecipe(item)
    })
}

/* displaying function for recipe and adding it to recipe list container */
function displayRecipe(recipe){
    const recipeCard = document.createElement('div')
    recipeCard.className = 'recipe'

    const imgContainer = document.createElement('div')
    imgContainer.className = 'img-container'

    const img = document.createElement('img')
    img.src = recipe.image
    img.alt = recipe.title

    const title = document.createElement('p')
    title.textContent = recipe.title

    const btnContainer = document.createElement('div')
    btnContainer.className = 'btn-container'

    const moreInfoBtn = document.createElement('button')
    moreInfoBtn.className = 'info-btn btn'
    moreInfoBtn.textContent = 'More Info'
    moreInfoBtn.onclick = () => detailInfo(recipe.id)

    const favBtn = document.createElement('button')
    favBtn.className = 'favorites-btn btn'
    /* checking recipe if it in favorites and setting relevant class for this */
    if(favoritesIncludeRecipe(recipe)) favBtn.classList.add('favorite')
    /* listener for button to adding or deleting from favorites */
    favBtn.onclick = function() {
        toggleToFavorites(recipe)
        this.classList.toggle('favorite')
    }
    

    const favIcon = document.createElement('img')
    favIcon.src = './img/favorite.svg'
    favIcon.alt = 'Add to Favorites'
    favIcon.style.fill = 'red'

    recipesContainer.appendChild(recipeCard)
    recipeCard.appendChild(imgContainer)
    recipeCard.appendChild(title)
    recipeCard.appendChild(btnContainer)
    imgContainer.appendChild(img)
    btnContainer.appendChild(moreInfoBtn)
    btnContainer.appendChild(favBtn)
    favBtn.appendChild(favIcon)
}

/* detail info section displayer */
function displayDetailInfo(recipe) {
    detailInfoContainer.style.display = 'block'

    const header = document.createElement('div')
    header.className = 'detail-info-header'
    const title = document.createElement('h2')
    title.textContent = recipe.title
    const closeButton = document.createElement('button')
    closeButton.className = 'btn'
    closeButton.textContent = 'X'
    closeButton.onclick = () => hideDetailInfo() /* setting detail section close function onlick */
    header.appendChild(title)
    header.appendChild(closeButton)

    const imgContainer = document.createElement('div')
    imgContainer.className = 'img-container'
    const img = document.createElement('img')
    img.src = recipe.image
    img.alt = recipe.title
    imgContainer.appendChild(img)

    const timeInfo = document.createElement('div')
    timeInfo.className = 'time-info'
    const prepTime = document.createElement('p')
    prepTime.innerHTML = `<strong>Preparation Time:</strong> ${recipe.preparationMinutes? recipe.preparationMinutes : "?"} minutes`
    const cookTime = document.createElement('p')
    cookTime.innerHTML = `<strong>Cooking Time:</strong> ${recipe.cookingMinutes? recipe.cookingMinutes : "?"} minutes`
    timeInfo.appendChild(prepTime)
    timeInfo.appendChild(cookTime)

    const summary = document.createElement('div')
    summary.className = 'summary'
    summary.innerHTML = recipe.summary

    const ingredientsHeader = document.createElement('h3')
    ingredientsHeader.textContent = 'Ingredients'
    const ingredientsList = document.createElement('ul')
    ingredientsList.className = 'ingredients-list'
    recipe.extendedIngredients.forEach(ing => {
        /* displaying items of ingredients */
        const li = document.createElement('li')
        li.textContent = ing.original
        ingredientsList.appendChild(li)
    })

    const instructionsHeader = document.createElement('h3')
    instructionsHeader.textContent = 'Cooking Instructions'
    const instructionsList = document.createElement('ol')
    instructionsList.className = 'instructions-list'
    /* displaying steps */
    recipe.analyzedInstructions[0].steps.forEach(step => {
        const li = document.createElement('li')
        li.textContent = step.number + ") " + step.step
        instructionsList.appendChild(li)
    })

    const nutritionHeader = document.createElement('h3')
    nutritionHeader.textContent = 'Nutritional Information'
    const nutritionList = document.createElement('ul')
    nutritionList.className = 'nutritional-info'
    /* displaying nutrients items */
    recipe.nutrition.nutrients.forEach(nutrient => {
        const li = document.createElement('li')
        li.innerHTML = `<strong>${nutrient.name}:</strong> ${nutrient.amount} ${nutrient.unit}`
        nutritionList.appendChild(li)
    })

    detailInfoContainer.appendChild(header)
    detailInfoContainer.appendChild(imgContainer)
    detailInfoContainer.appendChild(timeInfo)
    detailInfoContainer.appendChild(summary)
    detailInfoContainer.appendChild(ingredientsHeader)
    detailInfoContainer.appendChild(ingredientsList)
    detailInfoContainer.appendChild(instructionsHeader)
    detailInfoContainer.appendChild(instructionsList)
    detailInfoContainer.appendChild(nutritionHeader)
    detailInfoContainer.appendChild(nutritionList)
}

/* hide fetail info section function */
function hideDetailInfo(){
    detailInfoContainer.innerHTML = ''
    detailInfoContainer.style.display = 'none'
}

/* function for setting suggests into suggestions class tag */
async function displayAutoComplete(){
    suggestions.innerHTML = ''
    /* request for autocomplete endpoint of api */
    let response = await fetch(`${baseUrl}autocomplete?apiKey=${apiKey}&number=5&query=${nameInput.value}`)
    response = await response.json()

    /* displaying every suggestion from api */
    response.forEach(item => {
        const suggestion = document.createElement('div')
        suggestion.className = 'suggestion'
        suggestion.innerHTML = item.title
        
        suggestions.appendChild(suggestion)

        /* listener for suggestion when click puts value into name input and calls search function and clear suggestions class tag */
        suggestion.addEventListener('click', function(){
            nameInput.value = this.innerHTML
            suggestions.innerHTML = ''
            search()
        })
    })
}
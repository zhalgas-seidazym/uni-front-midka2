const baseUrl = 'https://api.themoviedb.org/3/'
const apiKey = 'b54bbc6e8629b31995720b12b38f65b9'

/* movies will contain current seeing movies and favorites gets data from local storage */
let movies = []
let favorites = JSON.parse(localStorage.getItem('favoriteFilms')) || [] /* initializing */

/* need elements from html */
const input = document.querySelector('.name-input')
const suggestions = document.querySelector('.suggestions')
const select = document.querySelector('.sort-select')
const details = document.querySelector('.movie-details')

/* when page is loaded first initializes favorites in local storage if need and then displays favorites */
window.onload = async () => {
    !localStorage.getItem('favoriteFilms') ? localStorage.setItem('favoriteFilms', JSON.stringify([])) : 
    displayFavorites()
}

/* when details section is open and clicked other place detail page will close */
document.addEventListener('mousedown', (event) => {
    var detailInfoContainer = document.querySelector('.movie-details')

    if (!detailInfoContainer.contains(event.target)) {
        closeDetails()
    }
})

/* this is for displaying autocomples */
input.addEventListener('input', async () => {
    if(input.value.length >= 3){
        /* here is length is more than 2 i send request to server to take films that contains this value */
        suggestions.innerHTML = ''
        let sugs = await fetch(`${baseUrl}search/movie?api_key=${apiKey}&query=${input.value}`)
        sugs = await sugs.json()
        /* and here added suggestions to suggestions class tag */
        sugs.results.forEach(result => {
            const suggestion = document.createElement('div')
            suggestion.className = 'suggestion'
            suggestion.innerText = result.title
            suggestions.appendChild(suggestion)

            /* here listener for every suggestion that will put value of this to input value and call search function */
            suggestion.addEventListener('click', (event) => {
                input.value = event.target.innerText
                suggestions.innerHTML = ''
                search()
            })
        })
    }
})

/* listener for input clicked enter that will hide suggestions and call function search */
input.addEventListener('keydown', (event) => {
    if(event.key == "Enter"){
        event.preventDefault()
        suggestions.innerHTML = ''
        suggestions.style.display = 'none'
        search()
    }
})

/* when value of select changes firstly done sort for movies array that contains current showing movies and then display it sorted order */
select.addEventListener('change', () => {
    sort()
    displayMovieList()
})

/* this two listeners for suggestions hide and show when focusing input */
input.addEventListener('focus', () => {
    suggestions.style.display = 'flex'
})

input.addEventListener('blur', () => {
    setTimeout(() => {
        suggestions.innerHTML = ''
        suggestions.style.display = 'none'
    }, 150)
})

/* this function for adding and deleting from favorites and updating local storage favorites value */
function toggleToFavorites(movie){
    const index = favoritesIndexOfMovie(movie)
    
    if (index === -1) {
        favorites.push(movie);
    } else {
        favorites.splice(index, 1);
    }
    localStorage.setItem('favoriteFilms', JSON.stringify(favorites))
}

/* this function is for checking that movie is in favorites or not */
function favoritesIncludeMovie(movie){
    return favorites.some(item => item.id === movie.id)
}

/* this function is for giving index of movie if it is in favorites */
function favoritesIndexOfMovie(movie){
    return favorites.findIndex(item => item.id === movie.id)
}

/* in this function we get data from api, put it into current movies sorting it and then calling display function */
async function search(){
    movies = await fetch(`${baseUrl}search/movie?api_key=${apiKey}&query=${input.value}`)
    movies = await movies.json()
    movies = movies.results
    sort()
    displayMovieList()
}

/* this function sets favorites into current movies, sorting it and diplaying */
function displayFavorites(){
    movies = [...favorites]
    input.value = ''
    sort()
    displayMovieList()
}

/* this function sorts movies by value of select */
function sort(){
    /* this two if for popularity sort */
    if(select.value == 'popularity.asc'){
        movies.sort((a, b) => a.popularity - b.popularity)
    }
    else if(select.value == 'popularity.desc'){
        movies.sort((a, b) => b.popularity - a.popularity)
    }
    /* this two for sorting by date */
    else if (select.value == 'release_date.asc') {
        movies.sort((a, b) => {    
            if (!a.release_date) return 1
            if (!b.release_date) return -1
    
            return new Date(a.release_date) - new Date(b.release_date)
        })
    }
    else if (select.value == 'release_date.desc') {
        movies.sort((a, b) => {    
            if (!a.release_date) return 1
            if (!b.release_date) return -1
    
            return new Date(b.release_date) - new Date(a.release_date)
        })
    }
    /* this two for sorting by rating */
    else if(select.value == 'rating.asc'){
        movies.sort((a, b) => a.vote_average - b.vote_average)
    }
    else if(select.value == 'rating.desc'){
        movies.sort((a, b) => b.vote_average - a.vote_average)
    }
}

/* here displaying in screen */
function displayMovieList() {
    const container = document.querySelector('.list-container')
    container.innerHTML = ''

    movies.forEach(movie => {
        const title = movie.title || "Unknown Name"
        const releaseDate = movie.release_date || "Unknown Date"
        const posterPath = movie.poster_path 
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` 
            : './img/null.webp'

        const filmCard = document.createElement('div')
        filmCard.classList.add('film-card')
        filmCard.dataset.id = movie.id
        /* listener for movie card to see detail section */
        filmCard.addEventListener('click', () => {
            displayDetails(movie.id)
        })

        const watchlistButton = document.createElement('button')
        watchlistButton.type = 'button'
        watchlistButton.classList.add('add-watch-list-btn', 'btn')
        /* here when displaying card checking if it in favorites and adding relevant class */
        if(favoritesIncludeMovie(movie)) {
            watchlistButton.classList.add('favorite')
        }
        /* here adding listener to button to add or remove from favorite */
        watchlistButton.addEventListener('click', function(event) {
            event.stopPropagation() /* prevents clicking card when clicking button */
            toggleToFavorites(movie)
            watchlistButton.classList.toggle('favorite')
        })

        const favoriteIcon = document.createElement('img')
        favoriteIcon.src = './img/favorite.svg'
        favoriteIcon.alt = 'Add to Watchlist'
        watchlistButton.appendChild(favoriteIcon)

        const filmImg = document.createElement('img')
        filmImg.src = posterPath
        filmImg.alt = `${title} Poster`
        filmImg.classList.add('film-img')

        const titleElement = document.createElement('p')
        titleElement.classList.add('name')
        titleElement.textContent = title

        const dateElement = document.createElement('p')
        dateElement.classList.add('date')

        dateElement.textContent = releaseDate !== "Unknown Date" 
            ? new Date(releaseDate).toLocaleDateString('en-US', {
                day: 'numeric', month: 'long', year: 'numeric'
            })
            : 'Unknown Date'

        filmCard.appendChild(watchlistButton)
        filmCard.appendChild(filmImg)
        filmCard.appendChild(titleElement)
        filmCard.appendChild(dateElement)

        container.appendChild(filmCard)
    })
}

/* this function for displaying detailed movie informations */
async function displayDetails(id){
    /* taking informtaion about film */
    let res = await fetch(`${baseUrl}movie/${id}?api_key=${apiKey}`)
    res = await res.json()

    details.style.display = 'block'

    console.log(res)
    const filmImg = details.querySelector('.movie-poster')
    filmImg.src = res.poster_path ? `https://image.tmdb.org/t/p/h632${res.poster_path}` : './img/null.webp'

    const movieTitle = details.querySelector('.movie-title')
    movieTitle.innerText = res.title || "Unknown"

    const movieTagline = details.querySelector('.movie-tagline')
    movieTagline.innerText = res.tagline || 'Movie'

    const synopsis = details.querySelector('.synopsis')
    synopsis.innerText = res.overview || 'This is movie.'

    const rating = details.querySelector('.rating')
    rating.innerHTML = `
        <strong>Rating: </strong> ${res.vote_average} / 10 (based on ${res.vote_count} votes)
    `

    const runtime = details.querySelector('.runtime')
    runtime.innerHTML = `
        <strong>Runtime: </strong> ${res.runtime} minutes
    `

    const release = details.querySelector('.release')
    if(res.release_date){
        const date = new Date(res.release_date)
        const formattedDate = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })

        release.innerHTML = `
        <strong>Release Date: </strong> ${formattedDate}
        `
    } 
    else {
        release.innerHTML = `
        <strong>Release Date: </strong> Unknown Date
        `
    }

    const extraInfo = details.querySelectorAll('.bento-container')
    extraInfo[0].innerHTML = ''
    extraInfo[1].innerHTML = ''
    extraInfo[2].innerHTML = ''

    res.genres.forEach(genre => {
        const genreDiv = document.createElement('div')
        genreDiv.classList.add('bento-piece')
        genreDiv.innerText = genre.name

        extraInfo[0].appendChild(genreDiv)
    })

    res.production_countries.forEach(country => {
        const countryDiv = document.createElement('div')
        countryDiv.classList.add('bento-piece')
        countryDiv.innerText = country.name

        extraInfo[1].appendChild(countryDiv)
    })

    res.production_companies.forEach(company => {
        const companyDiv = document.createElement('div')
        companyDiv.classList.add('bento-piece')
        companyDiv.innerText = company.name

        extraInfo[2].appendChild(companyDiv)
    })

    /* getting actors and other people information */
    res = await fetch(`${baseUrl}movie/${id}/credits?api_key=${apiKey}`)
    res = await res.json()

    /* dipslaying it */
    const crewList = details.querySelector('.crew-list')
    res.cast.forEach(act => {
        const crewMember = document.createElement('div')
        crewMember.classList.add('crew-member')
        crewList.appendChild(crewMember)

        const crewImg = document.createElement('img')
        crewImg.src = act.profile_path ? `https://image.tmdb.org/t/p/h632${act.profile_path}` : './img/null.webp'
        crewMember.appendChild(crewImg)

        const crewName = document.createElement('p')
        crewName.classList.add('crew-name')
        crewName.innerText = act.name || "Unknown"
        crewMember.appendChild(crewName)

        const crewRole = document.createElement('div')
        crewRole.classList.add('crew-role')
        crewRole.innerText = 'Character: ' + act.character || 'Unknown'
        crewMember.appendChild(crewRole)
    })
}

/* function for closing detail section */
function closeDetails(){
    details.style.display = 'none'
}
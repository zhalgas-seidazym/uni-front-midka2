const baseUrl = 'https://api.openweathermap.org/data/2.5/'
const apiKey = '45fffa8ab884e1f5a78adb3581c2b225'

let tempType = 'metric'
let tempIcon = '°C'

const cityInput = document.querySelector('.city-input')
const weatherTop = document.querySelector('.weather-top')
const weatherBody = document.querySelector('.weather-body')

window.onload = function(){
    new google.maps.places.Autocomplete(document.querySelector('.city-input'), { types: ['(cities)']})
    currentWeather()
}

document.getElementById('units-select').addEventListener('change', function() {
    updateTemperatureVariables(this.value)
    searchByName(weatherTop.querySelector('.location-text').innerText)
})

document.querySelector('.search-btn').addEventListener('click', function(){
    if(cityInput.value != ''){
        searchByName(cityInput.value)
    }
    else {
        this.classList.add('btn-animate')
        setTimeout(() => {
            this.classList.remove('btn-animate')
        }, 1000)
    }
})

document.querySelector('.current-btn').addEventListener('click', function(){
    currentWeather()
})

cityInput.addEventListener('keydown', function(event){
    if(event.key == "Enter"){
        event.preventDefault()
        searchByName(cityInput.value)
    }
})

function currentWeather(){
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(success, error)
    } else {
        console.error('Geolocation is not supported by this browser.')
    }
}


function success(position) {
    searchByPos(position.coords.latitude, position.coords.longitude)
}

function error(err) {
    console.error('Error occurred: ', err.message);   
}

async function searchByPos(lat, long) {
    let curWeather = await fetch(`${baseUrl}weather?appid=${apiKey}&lat=${lat}&lon=${long}&units=${tempType}`)
    curWeather = await curWeather.json() 
    displayWeather(curWeather)
    let futureWeather = await fetch(`${baseUrl}forecast?appid=${apiKey}&lat=${lat}&lon=${long}&units=${tempType}`)
    futureWeather = await futureWeather.json()
    displayForFuture(futureWeather)
}

async function searchByName(name) {
    let curWeather = await fetch(`${baseUrl}weather?appid=${apiKey}&q=${name}&units=${tempType}`)
    curWeather = await curWeather.json() 
    displayWeather(curWeather)
    let futureWeather = await fetch(`${baseUrl}forecast?appid=${apiKey}&q=${name}&units=${tempType}`)
    futureWeather = await futureWeather.json()
    displayForFuture(futureWeather)
}

function displayWeather(curWeather){
    cityInput.value = ''
    weatherTop.querySelector('.location-text').innerHTML = curWeather.name
    weatherBody.querySelector('.weather-icon').src = `https://openweathermap.org/img/wn/${curWeather.weather[0].icon}@4x.png`
    weatherBody.querySelector('.weather-description').innerText = capitalizeFirstLetter(curWeather.weather[0].description)
    weatherBody.querySelector('.temperature-value').innerText = curWeather.main.temp + tempIcon
    weatherBody.querySelector('.feels-like-value').innerText = curWeather.main.feels_like + tempIcon
    weatherBody.querySelector('.humidity-value').innerText = curWeather.main.humidity + "%"
    weatherBody.querySelector('.wind-speed-value').innerText = curWeather.wind.speed + "m/s"
}

function displayForFuture(futureWeather){
    let curDate = new Date()

    const days = document.querySelectorAll('.day')
    days.forEach(day => {
        day.querySelector('.date').innerText = curDate.toLocaleDateString('en-US', { weekday: 'long' })
        let dayData = findDayData(curDate, futureWeather)
        day.querySelector('.high').innerHTML = dayData.maxTemperature + tempIcon
        day.querySelector('.low').innerHTML = dayData.minTemperature + tempIcon
        day.querySelector('.weather-icon').src = `https://openweathermap.org/img/wn/${dayData.mostPopularIcon}@4x.png`
        day.querySelector('.description').innerText = capitalizeFirstLetter(dayData.mostPopularDescription)
        curDate.setDate(curDate.getDate() + 1)
    })
}

function capitalizeFirstLetter(str){
    return str.replace(/\b(\w)/g, function(match) {
        return match.toUpperCase()
    })
}

function updateTemperatureVariables(selectedValue) {
    if (selectedValue === 'metric') {
        tempType = 'metric'
        tempIcon = '°C'
    } else if (selectedValue === 'standard') {
        tempType = 'standard'
        tempIcon = 'K'
    } else if (selectedValue === 'imperial') {
        tempType = 'imperial'
        tempIcon = '°F'
    }
}

function findDayData(curDate, data) {
    const targetDate = curDate.getDate()
    let maxTemp = -Infinity;
    let minTemp = Infinity;

    let iconCounts = {}
    let descriptionCounts = {}

    const dailyData = data.list.filter(item => item.dt_txt.split(' ')[0].endsWith(targetDate))

    dailyData.forEach(item => {
        if (item.main.temp_max > maxTemp) {
            maxTemp = item.main.temp_max
        }
        if (item.main.temp_min < minTemp) {
            minTemp = item.main.temp_min
        }

        const icon = item.weather[0].icon
        if (iconCounts[icon]) {
            iconCounts[icon]++
        } else {
            iconCounts[icon] = 1
        }

        const description = item.weather[0].description
        if (descriptionCounts[description]) {
            descriptionCounts[description]++
        } else {
            descriptionCounts[description] = 1
        }
    })


    let mostPopularIcon = null
    let maxCount = 0
    for (let icon in iconCounts) {
        if (iconCounts[icon] > maxCount) {
            maxCount = iconCounts[icon]
            mostPopularIcon = icon
        }
    }

    let mostPopularDescription = null
    maxCount = 0
    for (let description in descriptionCounts) {
        if (descriptionCounts[description] > maxCount) {
            maxCount = descriptionCounts[description]
            mostPopularDescription = description
        }
    }


    return {
        mostPopularDescription,
        mostPopularIcon,
        maxTemperature: maxTemp,
        minTemperature: minTemp
    }
}
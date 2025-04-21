import {getUserLocation, getLocationString} from './modules/location.js';
import {getWeather, getNext6Hours, searchLocation} from './modules/weather.js';
import {generateText} from './modules/groq.js'

//Read from location storage to save the users location OPTIONAL


//Add event listener to location button to get user's location
document.getElementById("location-btn").addEventListener('click', () => {
    getUserLocation(async (lat, long, locationString) => {
        //Update location bar
        displayLocation(locationString);

        //Invoke weather api function
        const weather = await getWeather(lat, long, locationString);


        //Example of what the weather object looks like 
        // weather = {
        //     current: {
        //         temp:,
        //         condition:,
        //         etc:
        //     },
        //     forecast: {
        //         [ //Array of objects, each object represents a day, 6 days
        //             { //Each object in array looks like this
        //                 chanceToRain:,
        //                 chancetoSnow:,
        //                 date:,
        //                 hour: [ //Another array of objects to represent all 24 hours
        //                     {
        //                         temp:,
        //                         condition:,
        //                         etc
        //                     }
        //                 ] 
        //             }
        //         ]
        //     }
        // }

        //Ask GROQ API to generate random paragraph based on weather conditions
        const generatedText = await generateText(weather);
        //console.log(generatedText);

        displayAiText(generatedText);
        //Display weather information
        displayWeather(weather); 
        
        
    });
    
});

//Add event listener for user to type in location
document.getElementById("location-bar").addEventListener('keydown', async (e) => {
    if (e.key === 'Enter') {
        const location = e.target.value.trim();
        if (location) {
            await handleManualLocationSearch(location);
        }
    }
});

async function handleManualLocationSearch(query) {
    const result = await searchLocation(query);

    //console.log(result)
    const lat = result.lat;
    const lon = result.lon;
    const locationString = getLocationString(result);

    //Display the autocompletion location from api
    displayLocation(locationString); 
    //console.log(locationString)

    //Get the weather
    const weather = await getWeather(lat, lon, locationString);
    //Display the weather
    //console.log(weather);
    const generatedText = await generateText(weather);
    displayWeather(weather);
    displayAiText(generatedText);
}

//Function displays weather using DOM manipulation
function displayWeather(weather){
    //Select element
    const tempElement = document.getElementById("display-temp");
    tempElement.innerHTML="";
    const conditionElement = document.getElementById("display-condition");
    conditionElement.innerHTML="";

    //Set text inside of elements 
    const temperature = Math.round(weather.current.temp);
    const condition = weather.current.condition;
    const precipitation = weather.current.precip;
    const feelsLike = Math.round(weather.current.feelslike);
    const visibility = weather.current.visibility;
    const humidity = weather.current.humidity;
    const time = weather.current.time; // returns something like this "2025-04-20 19:45"
    const hour = parseInt(time.split(" ")[1].split(":"), 10);

    //Display current weather information
    tempElement.textContent = `${temperature}°`;
    conditionElement.textContent = `${condition}`;

    //Display feels like, precipitation, visibility, humidity
    document.getElementById("feels-like").textContent = `${feelsLike}`;
    document.getElementById("precipitation").textContent = `${precipitation}"`;
    document.getElementById("visibility").textContent = `${visibility}`;
    document.getElementById("humidity").textContent = `${humidity}%`;

    //Get the next 6 hour forecast
    const hourlyForecast = getNext6Hours(weather, hour);
    //hourlyContainer is an array that contains objects {hour: 22, temp: 20}

    //Display the hourly forecast
    const hourlyContainer = document.getElementById("hourly-forecast");
    hourlyContainer.innerHTML="";
    
    for (let i = 0; i < hourlyForecast.length; i++) {
        //Create new div element
        const newDiv = document.createElement("div");
        newDiv.classList.add("hourly-info");

        //Create element for time
        const hourElement = document.createElement("h6");
        hourElement.textContent = `${hourlyForecast[i].hour}:00`;
        //Create temp element
        const tempElement = document.createElement("h5");
        tempElement.textContent = `${hourlyForecast[i].temp}°`;

        //Append child elements to newDiv
        newDiv.appendChild(hourElement);
        newDiv.appendChild(tempElement);

        //Append to main div
        hourlyContainer.appendChild(newDiv);
    }

    //Display 6 day forecast
    const dayForecastContainer = document.getElementById("day-forecast");
    dayForecastContainer.innerHTML="";

    //Iterate through each forecast object
    for(let i = 0; i < weather.forecast.length; i++) {
        const newDiv = document.createElement("div");
        newDiv.classList.add("days-info");

        const temp = Math.round(weather.forecast[i].avgTemp);
        const stringDate = weather.forecast[i].date.slice(5, 10); //Weather date is in the format of '2025-04-21 13:30'
        const date = new Date(weather.forecast[i].date);
        //Get short weekday (Mon, Tues, Wed, etc.)
        const weekday = date.toLocaleDateString('en-US', { weekday: 'short' });

        const dayElement = document.createElement("h6");
        dayElement.textContent = `${weekday}`;

        const dateElement = document.createElement("p");
        dateElement.textContent = `${stringDate}`;

        const tempElement = document.createElement("h5");
        tempElement.textContent = `${temp}°`;

        newDiv.appendChild(dayElement);
        newDiv.appendChild(dateElement);
        newDiv.appendChild(tempElement);

        dayForecastContainer.appendChild(newDiv);
    }

    //Display UV and wind information
    const uvContainer = document.getElementById("uv-info");
    uvContainer.innerHTML="";
    const windContainer = document.getElementById("wind-info");
    windContainer.innerHTML="";

    const uvDiv = document.createElement("div");
    const windDiv = document.createElement("div");

    const uvHeader = document.createElement("h5");
    const windHeader = document.createElement("h5");
    const uvText = document.createElement("h4");
    const windText = document.createElement("h4");

    uvHeader.textContent = `UV INDEX`;
    windHeader.textContent = `WIND`;
    uvText.textContent = `${weather.current.uv}`
    windText.textContent = `${weather.current.windSpd}`;

    uvDiv.appendChild(uvHeader);
    uvDiv.appendChild(uvText);
    windDiv.appendChild(windHeader);
    windDiv.appendChild(windText);
    
    uvContainer.append(uvDiv);
    windContainer.append(windDiv);

    //Update location storage of the user's location OPTIONAL

} 

function displayAiText(generatedText) {
    const element = document.getElementById("display-paragraph");
    element.innerHTML="";
    element.textContent= generatedText;
}

function displayLocation(locationString) {
    //Update location-bar UI 
    const element = document.getElementById("location-bar");
    element.value = locationString;
}





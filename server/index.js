//Backend logic Node server entry point

import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import axios from 'axios'
import {Groq} from 'groq-sdk';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.static('public'));

const groq = new Groq({apiKey: process.env.GROQ_API_KEY});

// API route to reverse geocode
app.get('/api/reverse-geocode', async (req, res) => {
    const { lat, lon } = req.query;

    try {
        //Make api call using axios 
        const response = await axios.get(`https://api.opencagedata.com/geocode/v1/json`, {
            params: {
                key: process.env.OPENCAGE_API_KEY,
                q: `${lat},${lon}`,
                pretty: 1
            }
        });

        res.json(response.data);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch geocode data.' });
    }
});


//API route to weather 
//Async function for fetching weather data
//Base URL http://api.weatherapi.com/v1
//Forecast http://api.weatherapi.com/v1/forecast.json  
//Current weather http://api.weatherapi.com/v1/current.json
//Autocompletion http://api.weatherapi.com/v1/search.json

app.get('/api/weather', async (req, res) => {
    //Destructure req
    const {lat, lon, locationString} = req.query;

    //console.log(lat, lon, locationString)
    
    let queryParam;

    //Set priority on which parameter to use for more accurate weather based on user's input
    if (locationString) {
        queryParam = `${locationString}`
    }
    else if (lat && lon) {
        queryParam = `${lat},${lon}`
    } 
    else {
        return res.status(400).json({error: "Missing query parameters"});
    }

    //Try to call weather api
    try {
        
        const response = await axios.get(`http://api.weatherapi.com/v1/forecast.json`, {
            params: {
                key: process.env.WEATHER_API_KEY,
                q: queryParam,
                days: 6
            }
        });

        const result = response.data;
        
        if (!result) {
            return res.status(404).json({error: 'No weather results found.'});
        }
        //console.log(result)
        
        //Process the information
        const formattedData = fortmatData(result);

        res.json(formattedData); //This sends the data back to front end

    }
    catch (err) {
        console.log('Failed to fetch weather data: ', err);
    }

});

//Create endpoint for autocompletion
app.get('/api/search', async (req, res) => {
    const {q} = req.query;
    if (!q) return res.status(400).json({ error: 'Missing search query' });

    try {
        const response = await axios.get('http://api.weatherapi.com/v1/search.json', {
            params: {
                key: process.env.WEATHER_API_KEY,
                q
            }
        });
        const result = response.data;
        res.json(result);
    }

    catch (err) {
        console.log('Failed fetching data from search api: ', err);
    }
});

//Create endpoint for handling GROQ API
app.post('/api/groq', async (req, res) => {
    const {
        temp,
        condition,
        precip,
        feelslike,
        windSpd,
        uv,
        gust,
        visibility
    } = req.query;

    //Prompt what to ask ai
    const promt = `The weather is ${condition} with a temperature of ${temp}°F, feeling like ${feelslike}°F. Precipitation is ${precip}in, wind speeds reach ${windSpd}mph with gusts up to ${gust}mph, visibility is ${visibility} miles, and the UV index is ${uv}. Write exactly 2 brief sentences summarizing the current weather. Focus on the most notable details, and don’t include every stat. Return only the two sentences with no extra text, lines, or spacing.`;
    try {
        const completion = await groq.chat.completions.create({
            model: "llama3-8b-8192",

            messages: [
                {
                    role: "user",
                    content: promt
                }
            ],
        });
        const generatedText = completion.choices[0].message.content;
        res.json(generatedText);
    }
    catch (err) {
        console.log("Failed to fetch AI data: ", err);
    }
});

//Function formats the returned data from weather api. 
//We want information on current weather: temp, text, feels like, precipitation, visiblity, humidity, 
// uv, wind_mph, wind_dir, gust_mph//
function fortmatData(result) {
    console.log(result)
    //Create formatted object
    return {
        current: { //All the information we need for current weather
            time: result.current.last_updated, //"2025-04-20 16:15"
            temp: result.current.temp_f,
            condition: result.current.condition.text,
            feelslike: result.current.feelslike_f,
            precip: result.current.precip_in,
            visibility: result.current.vis_miles,
            humidity: result.current.humidity,
            windSpd: result.current.wind_mph,
            windDir: result.current.wind_dir,
            gust: result.current.gust_mph,
            uv: result.current.uv,
            windChill: result.current.windchill_f
        },
        forecast: result.forecast.forecastday.map(day => ({
            //Can also add day.day.condition{text, icon, code}
            date: day.date,
            avgTemp: day.day.avgtemp_f,
            chanceOfRain: day.day.daily_chance_of_rain,
            chanceOfSnow: day.day.daily_chance_of_snow,
            dailyWillRain: day.day.daily_will_it_rain, 
            dailyWillSnow: day.day.daily_will_it_snow,
            hour: day.hour.map(hour => ({
                time: hour.time, //Format of time "2025-04-20 00:00"
                chanceOfRain: hour.chance_of_rain,
                chanceOfSnow: hour.chance_of_snow,
                condition: hour.condition.text,
                temp: hour.temp_f //Can be decimals
            }))
        }))
    };

}

//Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});



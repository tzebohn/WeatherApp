//Handles all logic with using AI to help generate random paragraphs
//based on weather conditions
//Ex: Today, expect a rainy day with temperatures reaching a maxiumum of 28°F.
//    Make sure to grab your umbrella and raincoat before heading out.

//Function takes in a weather object and makes request to server
export async function generateText(weather) { 
    
    //Destructure weather object
    const {
        temp,
        condition,
        precip,
        feelslike,
        windSpd,
        uv,
        gust,
        visibility
    } = weather.current;

    //Recreate object
    const weatherData = {
        temp,
        condition,
        precip,
        feelslike,
        windSpd,
        uv,
        gust,
        visibility
    }

    //Convert object into string so we can pass into url easier
    const params = new URLSearchParams(weatherData);

    //Here we're going to try to use a post request instead since we are sending more data
    try {
        //Make fetch request to server endpoint
        const response = await fetch(`/api/Groq?${params.toString()}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(weatherData)
        });

        //Retrieve data back from backend
        const data = await response.json();
        //console.log(data)
        return data;
    }
    catch (err) {
        console.log('Error fetching backend server endpoint: ', err);
    }
    

}

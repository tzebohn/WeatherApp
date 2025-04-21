

export async function getWeather(lat, long, locationString) {
    
    //Format locationString "Name, Region"

    let url = `/api/weather?`;

    if (locationString) { //If there is a valid location send to server endpoint
        url += `locationString=${encodeURIComponent(locationString)}`;
    }
    else if (lat && long) {
        url += `lat=${lat}&lon=${long}`;
    }
    else {
        console.error("Insufficient data to fetch weather");
        return;
    }

    //Try to make a call to server endpoint
    try {
        //console.log(url)
        //Try to fetch endpoint of our server
        const response = await fetch(url);
        const data = await response.json();

        //console.log(data);

        //Process the returned data
        return data;
        
    }

    catch (err) {
        console.log('Error fetching backend server endpoint: ', err);
    }
}


export function getNext6Hours(weather, currentTime) {
    const hours = [];

    //Flatten out all the hours of each day into one array
    const allHours = weather.forecast.flatMap(day => day.hour);

    //console.log(currentTime);
    //console.log(allHours);

    //Iterate through each of the hours, break out of loop after 6 days 
    for (let i = currentTime; i < currentTime + 6; i ++) {
        //Covert time just it case it overlapped into next day
        const hour = parseInt(allHours[i].time.split(" ")[1].split(":"), 10);
        hours.push({ //add object into array
            hour: hour,
            temp: Math.round(allHours[i].temp)
        });
    }
    //console.log(hours)
    return hours;
}

export async function searchLocation(query) {
    if (!query) {
        return;
    }

    try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();

        //console.log(data)
        //data is an array of objects. Each object looks like this 
        // {country: , id:, lat:, lon:, name:, region:}
        return data[0]; 
    }
    catch (err){
        console.error('Error searching for location:', err);
    }
}

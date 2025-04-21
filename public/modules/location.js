
//Function uses the browser's built in geolocation
export function getUserLocation(callback){
    //Check if geolocation is supported by browser
    if (navigator.geolocation) {
        //Try to get the user's location. getCurrentPosition is an async function that returns a promise (resolved, rejected)
        navigator.geolocation.getCurrentPosition(
            (position) => success(position, callback),
            error
        );
    }
    else {
        alert("Geolocation is not supported by your browser.");
    }
}

//Function gets called if promise is resolved
function success(position, callback){
    //Extract long and lat from position object
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    //Translate latitude and longitude into city, state, etc. This process is called Reverse Geocoding
    reverseGeocode(latitude, longitude, callback);
}

//Function gets called if promise is rejected
function error() {
    alert("Please enable your location in the settings.");
}

//Create an async function that calls the backend server
async function reverseGeocode(lat, long, callback) {
    try {
        //Fetch backend server endpoint
        const response = await fetch(`/api/reverse-geocode?lat=${lat}&lon=${long}`);
        const data = await response.json(); //Jsonify response object

        //console.log(data)
        // console.log(data.results[0].components.borough)
        // console.log(data.results[0].components.city)
        // console.log(data.results[0].components.state)
        // console.log(data.results[0].components.suburb)
        // console.log(data.results[0].components.country)
        // console.log(data.results[0].components.neighbourhood)

        //Extract data result.components.city result.components.country result.components.neighborhood
        const locationString = getLocationString(data.results[0].components);
        if (!locationString) { //Location is empty
            alert("Unkown Location");
            return;
        }

        //Getting location was successful pass the final location string to the callback
        callback(lat, long, locationString);
    }
    catch (err) {
        console.error("Error during reverse geocoding:", err);
    }
    



}

//Function filters out the location data
export function getLocationString(components) {
    //Use what we learned about destructuring of an object. Here we are unpacking each of keys in components
    const {
        neighbourhood,
        suburb,
        borough,
        city,
        state,
        country,
        name,
        region
    } = components;

    //Choose the first localarea is not undefined based on priority
    const localArea = suburb || neighbourhood || borough || city || name;

    //Choose the state or country
    const regions = state || country || region;

    if (localArea && regions) { //If both value exists return string in the format localArea, region
        return `${localArea}, ${regions}`; 
    }
    else if (localArea) { //Only localArea exists 
        return localArea;
    }
    else if (regions) {
        return regions;
    }
    else {
        return ''; //Return empty string if location is unknown
    }

}



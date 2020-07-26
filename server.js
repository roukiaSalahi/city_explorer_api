'use strict';
const server = require('express');
const cors = require('cors');
// const { request } = require('express');
require('dotenv').config();

const app = server();
app.use(cors());

const PORT = process.env.PORT || 3100;

// home page .. 
app.get('/', (request, response) => {
    response.status(200).send('This is the homepage');
    // 200 -> Ok
    // 404 -> Page not Found
    // 500 -> Internal Server error
});

// route 1 
// http://localhost:3100/location?city=amman
// http://localhost:3000/location

// Example Response:

// ```
// {
//   "search_query": "seattle",
//   "formatted_query": "Seattle, WA, USA",
//   "latitude": "47.606210",
//   "longitude": "-122.332071"
// }
// ``

app.get('/location', (request, response) => {
    const data = require('./data/location.json');
    let city = request.query.city;
    let locationData = new Location(city, data);
    response.send(locationData);
});

// route 2 
// http://localhost:3100/weather?city=amman
// http://localhost:3000/weather

// Example Response:

// ```
// [
//   {
//     "forecast": "Partly cloudy until afternoon.",
//     "time": "Mon Jan 01 2001"
//   },
//   {
//     "forecast": "Mostly cloudy in the morning.",
//     "time": "Tue Jan 02 2001"
//   },
//   ...
// ]
// ```


app.get('/weather', (request, response) => {
    const dataWeather = require('./data/weather.json');
    let city = request.query.city;
    Weather.all = [];
    dataWeather.data.forEach(element => {
        const time = new Date(element.valid_date);
        let longTimeStamp = time.toString();
        let weatherData = new Weather(city, element, longTimeStamp.substr(0, 15));
        // let weatherData = new Weather(city,element);

    });
    response.send(Weather.all);
});

// route 3

app.all('*', (request, response) =>{
    response.status(500).send('Sorry, something went wrong');
  });

app.listen(PORT, () => {
    console.log('Server is listening to port ', PORT);
});

// constructres

function Location(city, data) {
    this.search_query = city;
    this.formatted_query = data[0].display_name;
    this.latitude = data[0].lat;
    this.longitude = data[0].lon;
}
function Weather(city, data, date) {

    this.forecast = data.weather.description;
    this.time = date;
    Weather.all.push(this);
}


// function Weather(city, data) {

//     this.forecast = data.weather.description;
//     this.time = data.datetime;
//     Weather.all.push(this);
// }
















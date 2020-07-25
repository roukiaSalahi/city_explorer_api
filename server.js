'use strict';
const server = require('express');
const cors = require('cors');
// const { request } = require('express');
require('dotenv').config();
const superagent = require('superagent');
const app = server();
app.use(cors());
const PORT = process.env.PORT || 3100;
app.listen(PORT, () => {
    console.log('Server is listening to port ', PORT);
});

// home page .. 
app.get('/', (request, response) => {
    response.status(200).send('This is the homepage');
    // 200 -> Ok
    // 404 -> Page not Found
    // 500 -> Internal Server error
});

// route 1 
// http://localhost:3000/location?city=amman
// http://localhost:3000/location

app.get('/location', (request, response) => {
    let city = request.query.city;
    let APIKEYL = process.env.APIKEYL;
    let url = `https://eu1.locationiq.com/v1/search.php?key=${APIKEYL}&q=${city}&format=json`;
    superagent.get(url).then(data => {
        let locationData = new Location(city, data.body);
        response.send(locationData);
    });

});

// route 2
var locationLat = [];
var locationLon =[];
app.get('/weather', (request, response) => {
    let city = request.query.search_query;
    let APIKEYW = process.env.APIKEYW;
    // let url = `https://api.weatherbit.io/v2.0/forecast/daily?city=${city}&key=${APIKEYW}`;
    let url = `https://api.weatherbit.io/v2.0/forecast/daily?lat=${locationLat[0]}&lon=${locationLon[0]}&key=${APIKEYW}`;
    Weather.all = [];
    superagent.get(url).then(data => {

        data.body.data.forEach(element => {
            let weatherData = new Weather(city, element);
            // console.log(data);
        });
        response.send(Weather.all);
    });
})

// route 3 
app.get(`/trails`, (request, response) => {
    let city = request.query.search_query;
    let APIKEYH = process.env.APIKEYH;
    // let url = `https://www.hikingproject.com/data/get-trails?lat=40.0274&lon=-105.2519&key=200852284-73f`;
    let url = `https://www.hikingproject.com/data/get-trails?lat=${locationLat[0]}&lon=${locationLon[0]}&maxDistance=10&key=${APIKEYH}`;
    superagent.get(url).then(data => {
        data.body.data.forEach(element => {
            let trailData = new Trail(city, element);
        });
        response.send(Trail.all);
    });
})

// route 4

app.all('*', (request, response) => {
    response.status(500).send('Sorry, something went wrong');
});



// constructres

function Location(city, data) {
    this.search_query = city;
    this.formatted_query = data[0].display_name;
    this.latitude = data[0].lat;
    this.longitude = data[0].lon;
    locationLat.push(data[0].lat);
    locationLon.push(data[0].lon);
}
function Weather(city, data) {
    this.forecast = data.weather.description;
    this.time = new Date(data.valid_date).toString().slice(0, 15);
    Weather.all.push(this);
}

function Trail(city, data) {
    this.name = data.name;
    this.location = data.location;
    this.length = data.length;
    this.stars = data.stars;
    this.star_votes = data.starVotes;
    this.summary = data.summary;
    this.trail_url = data.url;
    this.conditions = data.conditionStatus;
    this.condition_details = data.conditionDetails;
    this.condition_time = data.conditionDate;
    Trail.all.push(this);
}






'use strict';
const server = require('express');
const cors = require('cors');
// const { request } = require('express');
require('dotenv').config();
const superagent = require('superagent');
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

app.get('/weather', (request, response) => {
    let city = request.query.search_query;
    let APIKEYW = process.env.APIKEYW;
    let url = `https://api.weatherbit.io/v2.0/forecast/daily?city=${city}&key=${APIKEYW}`;
    Weather.all = [];
    superagent.get(url).then(data => {

        data.body.data.forEach(element => {
            let weatherData = new Weather(city, element);
            console.log(data);
        });
        response.send(Weather.all);
    });
})

// route 3 
// app.get(`/trails`, (request, response) => {
//     let city = request.query.city;
//     let APIKEYH = process.env.APIKEYH;
//     let url = `https://www.hikingproject.com/data/get-trails?lat=40.0274&lon=-105.2519&key=200852284-73f`;
//     Weather.all = [];
//     superagent.get(url).then(data => {
//         data.forEach(element => {
//             let weatherData = new Weather(city, element);
//         });
//         response.send(Weather.all);
//     });
// })







// route 4

app.all('*', (request, response) => {
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
function Weather(city, data) {
    this.forecast = data.weather.description;
    this.time = new Date(data.valid_date).toString().slice(0, 15);
    Weather.all.push(this);
}
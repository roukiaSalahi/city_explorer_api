'use strict';
require('dotenv').config();
const server = require('express');

const cors = require('cors');
// const { request } = require('express');

const pg = require('pg');
const superagent = require('superagent');
const { request, response } = require('express');
const app = server();
app.use(cors());
const PORT = process.env.PORT || 3100;
const client = new pg.Client(process.env.DATABASE_URL);

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
    let selectSQL = `SELECT * FROM locations WHERE search_query ='${city}'`;
    client.query(selectSQL).then(result => {
        if (result.rowCount) {
            response.send(result.rows);
        } else {
            superagent.get(url).then(data => {
                let locationData = new Location(city, data.body);
                let queryValues = [locationData.search_query, locationData.formatted_query, locationData.latitude, locationData.longitude]
                let SQL = `INSERT INTO locations (search_query, formatted_query, latitude, longitude) VALUES ($1,$2,$3,$4)`;
               
                client.query(SQL, queryValues).then(result => {
                    response.send(locationData);
                });
            });
        }
    });
});


// route 2 by lon and lat
// http://localhost:3000/weather?latitude=35&longitude=35
app.get('/weather', (request, response) => {
    let longitude = request.query.longitude;
    let latitude = request.query.latitude;
    let APIKEYW = process.env.APIKEYW;
    // let url = `https://api.weatherbit.io/v2.0/forecast/daily?city=${city}&key=${APIKEYW}`;
    let url = `https://api.weatherbit.io/v2.0/forecast/daily?lat=${latitude}&lon=${longitude}&key=${APIKEYW}`;
    // Weather.all = [];
    superagent.get(url).then(data => {
        const weatherInfo = [];
        data.body.data.map(element => {
            let weatherData = new Weather(element);
            weatherInfo.push(weatherData);
        });
        response.send(weatherInfo);
    });
});

// route 3 
// app.get(`/trails`, (request, response) => {
//     let longitude = request.query.longitude;
//     let latitude = request.query.latitude;
//     let APIKEYH = process.env.APIKEYH;
//     // let url = `https://www.hikingproject.com/data/get-trails?lat=40.0274&lon=-105.2519&key=200852284-73f`;
//     let url = `https://www.hikingproject.com/data/get-trails?lat=${latitude}&lon=${longitude}&maxDistance=100&key=${APIKEYH}`;
//     superagent.get(url).then(data => {
//         data.body.data.forEach(element => {
//             let trailData = new Trail(city, element);
//         });
//         response.send(Trail.all);
//     });
// })

// route 4

app.all('*', (request, response) => {
    response.status(500).send('Sorry, something went wrong');
});



// constructres

function Location(city, data) {
    this.search_query = city;
    this.formatted_query = data[0].display_name; // because the data is in array reponse send (data.body) and see the data
    this.latitude = data[0].lat;
    this.longitude = data[0].lon;
   
}
function Weather(data) {
    this.forecast = data.weather.description;
    this.time = new Date(data.valid_date).toString().slice(0, 15);
}

// function Trail(city, data) {
//     this.name = data.name;
//     this.location = data.location;
//     this.length = data.length;
//     this.stars = data.stars;
//     this.star_votes = data.starVotes;
//     this.summary = data.summary;
//     this.trail_url = data.url;
//     this.conditions = data.conditionStatus;
//     this.condition_details = data.conditionDetails;
//     this.condition_time = data.conditionDate;
//     Trail.all.push(this);
// }

client.connect().then(() => {
    app.listen(PORT, () => {
        console.log('Server is listening to port ', PORT);
    });
})

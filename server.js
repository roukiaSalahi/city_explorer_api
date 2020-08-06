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

app.get('/location', (request, response) => {
    let city = request.query.city;
    let APIKEYL = process.env.APIKEYL;
    // let url = `https://eu1.locationiq.com/v1/search.php?key=${APIKEYL}&q=${city}&format=json`;
    let url = `https://api.locationiq.com/v1/autocomplete.php?key=${APIKEYL}&q=${city}&format=json`;
    let selectSQL = `SELECT * FROM locations WHERE search_query ='${city}'`;

    client.query(selectSQL).then(result => {
        if (result.rowCount) {
            console.log('From SQL')

            response.send(result.rows[0]);
        } else {
            console.log('From API')
            superagent.get(url).then(data => {
                console.log('From AP: ', data.body[0].address);

                let locationData = new Location(city, data.body);
                let queryValues = [city, data.body[0].display_name, data.body[0].lat, data.body[0].lon, data.body[0].address.country_code]
                let SQL = `INSERT INTO locations (search_query, formatted_query, latitude, longitude, country_code) VALUES ($1, $2, $3, $4, $5)`;

                client.query(SQL, queryValues).then(result => {

                    console.log(result.rows);

                    response.send(locationData);
                });
            }).catch(console.error);
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
// http://localhost:3000/trails?latitude=40.0274&longitude=-105.2519
// https://www.hikingproject.com/data/get-trails?lat=40.0274&lon=-105.2519&key=200852284-73f

app.get(`/trails`, (request, response) => {
    let longitude = request.query.longitude;
    let latitude = request.query.latitude;
    let APIKEYH = process.env.APIKEYH;
    let url = `https://www.hikingproject.com/data/get-trails?lat=${latitude}&lon=${longitude}&key=${APIKEYH}`;
    superagent.get(url).then(data => {
        const trailInfo = [];
        data.body.trails.map(element => {
            let trailData = new Trail(element);
            trailInfo.push(trailData);
        });
        response.send(trailInfo);
    });
})

// route 4 
//http://localhost:3000/movies?region=JO
//https://api.themoviedb.org/3/search/movie?api_key=${APIKEYM}&query=whiplash&language=en-US&region=JO

app.get('/movies', (request, response) => {
    let region = request.query.region;
    let APIKEYM = process.env.APIKEYM;
    let url = `https://api.themoviedb.org/3/search/movie?api_key=${APIKEYM}&query=whiplash&language=en-US&region=${region}`;
    superagent.get(url).then(data => {
        const movieInfo = [];
        data.body.results.map(element => {
            let movieData = new Movie(element);
            movieInfo.push(movieData);
        });
        response.send(movieInfo);
    }).catch(console.error);

})

// route 5 
//http://localhost:3000/yelp?latitude=35.2&longitude=35.3

app.get('/yelp', (request, response) => {
    let longitude = request.query.longitude;
    let latitude = request.query.latitude;
    let APIKEYR = process.env.APIKEYR;
    let url = `https://api.yelp.com/v3/businesses/search?latitude=${latitude}&longitude=${longitude}`;
    superagent.get(url).set('Authorization', `Bearer ${APIKEYR}`).then(data => {
        const resturantInfo = [];
        data.body.businesses.map(element => {
            let resturantData = new Resturant(element);
            resturantInfo.push(resturantData);
        });
        response.send(resturantInfo);
    });
})


// route 6

// app.all('*', (request, response) => {
//     response.status(500).send('Sorry, something went wrong');
// });

app.all('*', (req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET, HEAD, PUT, PATCH, POST, DELETE'
    );
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    next();
  });


// constructers

function Location(city, data) {
    this.search_query = city;
    this.formatted_query = data[0].display_name;
    this.latitude = data[0].lat;
    this.longitude = data[0].lon;
    this.country_code = data[0].country_code;
}

function Weather(data) {
    this.forecast = data.weather.description;
    this.time = new Date(data.valid_date).toString().slice(0, 15);
}

function Trail(data) {
    this.name = data.name;
    this.location = data.location;
    this.length = data.length;
    this.stars = data.stars;
    this.star_votes = data.starVotes;
    this.summary = data.summary;
    this.trail_url = data.url;
    this.conditions = data.conditionStatus;
    this.condition_date = data.conditionDate.split(' ')[0];
    this.condition_time = data.conditionDate.split(' ')[1];
  
}

function Movie(data) {
    this.title = data.title;
    this.overview = data.overview;
    this.average_votes = data.vote_average;
    this.total_votes = data.vote_count;
    this.image_url = `https://image.tmdb.org/t/p/w500${data.poster_path}`;
    this.popularity = data.popularity;
    this.released_on = data.release_date;
}

function Resturant(data) {
    this.name = data.name;
    this.image_url = data.image_url;
    this.price = data.price;
    this.rating = data.rating;
    this.url = data.url;
}

client.connect().then(() => {
    app.listen(PORT, () => {
        console.log('Server is listening to port ', PORT);
    });
})

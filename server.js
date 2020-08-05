'use strict'

require('dotenv').config();
const server = require('express');
const cors = require('cors');
const { request, response } = require('express');
const superagent = require('superagent');
const pg = require('pg');


const PORT = process.env.PORT || 3000;


const client = new pg.Client(process.env.DATABASE_URL)
const app = server();
app.use(cors());




//---------------Routes-----------

//home page
app.get('/', (request, response) => {
  response.status(200).send('Home page')
});


//route 1
// http://localhost:3000/location?city=amman

app.get('/location', handelLoc);


//route 2
// http://localhost:3000/weather?lat=number&lon=number

app.get('/weather', weatherFun)


//route 3
// http://localhost:3200/trails?lat=number&lon=number

app.get('/trails', trailsFun)


//route 4
// http://localhost:3000/movies?city=amman

app.get('/movies', handelMov);


//route 5
// http://localhost:3000/yelp?city=amman

app.get('/yelp', handelylep);







//---------------handelFunctions-----------

//location function

function handelLoc(request, response) {
  let city = request.query.city;
  // console.log(city)

  getData(city).then(returndata => {
    response.send(returndata)
  });
}


function getData(city) {

  let sql = `SELECT * FROM locations Where search_query=$1`;
  let assgin = [city];

 return client.query(sql, assgin)
    .then(results => {

      if (results.rowCount) {
        console.log('it saved ')
        return results.rows[0];
      }

      else {
        let key = process.env.APIKEY;
        let idlocation = `https://eu1.locationiq.com/v1/search.php?key=${key}&q=${city}&format=json&addressdetails=1`;
        // console.log(idlocation)
        
        return superagent.get(idlocation)
          .then(data => {
            let newlocation= new Location(city, data.body);
            // console.log('loc',newlocation.address)
            insert(city,newlocation).then((data) => {
             return newlocation;
              });
              return newlocation;
          })
      }
    })
}

//insert in database for location

function insert(city,newlocation) {

  let sql = `INSERT INTO locations (search_query, formatted_query ,latitude, longitude ,region) VALUES ($1,$2,$3,$4,$5)`;
  let save = [city, newlocation.formatted_query, newlocation.latitude, newlocation.longitude , newlocation.address];

  return client.query(sql, save).then(result => {
    return result;
  })

}




//Weather function

function weatherFun(request, response) {

  const lat = request.query.latitude;
  const lon = request.query.longitude;


  let KEY = process.env.WAPI;
  let url = `https://api.weatherbit.io/v2.0/forecast/daily?lat=${lat}&lon=${lon}&key=${KEY}`;

  return superagent.get(url)
    .then(getdata => {
      // console.log(getdata);
      let arrayWeather = [];
      getdata.body.data.map(data => {

        let newWeather = new Weather(data);
        arrayWeather.push(newWeather)
        return arrayWeather;
      });

      response.send(arrayWeather)
    })
}





//Trails function

function trailsFun(request, response) {

  const lat = request.query.latitude;
  const lon = request.query.longitude;
  //  const id=request.query.id;

  getTrials(lat, lon)
    .then(data => {
      response.send(data)
    });
}


function getTrials(lat, lon) {

  const KEY = process.env.Hiking;
  const url2 = `https://www.hikingproject.com/data/get-trails?lat=${lat}&lon=${lon}&maxDistance=100&key=${KEY}`;
 
  return superagent.get(url2)
    .then(datatrials => {

      let arr = [];
      
      datatrials.body.trails.map(element => {
        let newTrial = new Trials(element);
        arr.push(newTrial);
        // console.log(arr)
        return arr;
      })
      // console.log(arr)
      return arr
    })

}




//Movies function

function handelMov(request, response) {
  let region = request.query.address;
  getMovie(region).then(returndata => {
    response.send(returndata)
  });
}


function getMovie(region) {

  let KEY = process.env.MoviKEY;

   let url=`https://api.themoviedb.org/3/movie/top_rated?api_key=${KEY}&language=en-US&page=1&region=${region}`;
  // console.log(url)

  return superagent.get(url)
    .then(dataMovie => {

      let arr =dataMovie.body.results.map(element => {
        let newMovie = new Movies(element);
                return newMovie;
      })

      return arr
    })

}




//Yelp function

function handelylep  (request, response) {
  let lat = request.query.latitude;
  let lon = request.query.longitude;

  getYelp(lat,lon).then(returndata => {
    response.status(200).json(returndata)
  });
}


function getYelp(lat, lon) {
 
  let KEY=process.env.YELPKEY
  console.log(KEY);
    let url= `https://api.yelp.com/v3/businesses/search?term=restaurants&latitude=${lat}&longitude=${lon}`
 
  console.log('insideyelp',url)
  
  return superagent.get(url)
  .set('Authorization',`Bearer ${KEY}`)
    .then(datayelp => {
      // console.log('yelpdata',datayelp)
      let arr = datayelp.body.businesses.map(element => {
        return new Yelp(element);
   
      });
    //  console.log(arr)
      return arr
    });

}



//-----------------Constructors ----------

//Location constroctur 
function Location(city, data) {
  this.search_query = city;
  this.formatted_query = data[0].display_name;
  this.latitude = data[0].lat;
  this.longitude = data[0].lon;
  this.address=data[0].address.country_code.toUpperCase();
}



//weather constroctur 

function Weather(data) {
  this.forecast = data.weather.description;
  this.time = new Date(data.valid_date).toDateString();
}



//Trials constroctur 
function Trials(data) {
  this.name = data.name;
  this.location = data.location;
  this.stars = data.stars;
  this.star_votes = data.star_votes;
  this.trail_url = data.trail_url;
  this.conditions = data.conditions;
  this.condition_date = data.conditionDate.split(" ")[0];
  this.condition_time = data.conditionDate.split(" ")[1];

}




//Movies constroctur 
function Movies(data) {
  this.title = data.title;
  this.overview = data.overview;
  this.average_votes = data.vote_average;
  this.total_votes = data.vote_count;
  this.image_url = `https://image.tmdb.org/t/p/w500${data.poster_path}`;
  this.popularity = data.popularity;
  this.released_on = data.release_date;

}


//Yelp constroctur 
function Yelp(data) {
  this.name = data.name;
  this.image_url = data.image_url;
  this.price = data.price;
  this.rating =data.rating;
  this.url = data.url;

}





//*********

client.connect().then(() => {
  app.listen(PORT, () => {
    console.log('Server is listening to port ', PORT);
  });
});





// remain routes
app.all('*', (request, response) => {
  response.status(404).send('Sorry, page not found');
});

// ERORR
app.use((error, request, response, next) => {
  response.status(500).send('Sorry, something went wrong');
})

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



//home page
app.get('/', (request, response) => {
  response.status(200).send('Home page')
});



//route 1
// http://localhost:3000/location?city=amman

app.get('/location', handelLoc);


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
        let idlocation = `https://eu1.locationiq.com/v1/search.php?key=${key}&q=${city}&format=json`;
        // console.log(idlocation)
        
        return superagent.get(idlocation)
          .then(data => {
            let newlocation= new Location(city, data.body);
            insert(city,newlocation).then((data) => {
             return newlocation;
              });
              return newlocation;
          })
      }
    })
}



function insert(city,newlocation) {

  let sql = `INSERT INTO locations (search_query, formatted_query ,latitude, longitude) VALUES ($1,$2,$3,$4)`;
  let save = [city, newlocation.formatted_query, newlocation.latitude, newlocation.longitude];

  return client.query(sql, save).then(result => {
    return result;
  })

}



// app.get('/location', (request,response, next)=>{

// const data = require('./data/location.json');
// let city=request.query.city;
// let Apikey=process.env.APIKEY;

// const idlocation= `https://eu1.locationiq.com/v1/search.php?key=${Apikey}&q=${city}&format=json`

// try {
//   if (!city) throw new Error();
//   if (!isNaN(city)) throw new Error();
// } catch(err) {
//   next(err);
// }
// let newLoc = new Location(city ,idlocation);
// response.send(

// );
// });






//route 2
// http://localhost:3000/weather?city=amman

app.get('/weather', weatherFun)

function weatherFun(request, response) {

  // let city=request.query.city;
  const lat = request.query.latitude;
  const lon = request.query.longitude;


  let KEY = process.env.WAPI;
  // let url=`https://api.weatherbit.io/v2.0/forecast/daily?${city}=amman&key=${process.env.WAPI}`;
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





// app.get('/weather', handelWeather);

// function handelWeather(req, res) {
//   let city = req.query.city;

//   getWeather(city).then( returnedData => {
//     res.send(returnedData);
//   }).catch((err) => {
//     console.log(err.message);
//   });
// }

// function getWeather(city) {
//   Weather.all = [];

//   let KEY = process.env.WAPI;

//   let url = `https://api.weatherbit.io/v2.0/forecast/daily?city=${city}&key=${KEY}`;

//   return superagent.get(url).then( data => {
//     // console.log(data.body.data);
//     return data.body.data.map( item => {
//       // console.log(item.weather);
//       return new Weather(city, item);
//     });
//   });
// }





// app.get('/weather',(request,response)=>{

//   const weather = require('./data/weather.json');
//   const data=weather.data;
//   data.map((element,index)=>{
//     let newWeather = new Weather(data , index);
//   });
//   response.send(arrayWeather);
//   });






//route 3
// http://localhost:3200/trails

app.get('/trails', trailsFun)

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
  // const url2 =`https://www.hikingproject.com/data/get-trails-by-id?ids=${id}&key=${KEY}`

  // console.log(url2)
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



/*

//route 4
// http://localhost:3000/movies?city=amman

app.get('/movies', handelMov);

function handelMov(request, response) {
  let city = request.query.city;
  getMovie(city).then(returndata => {
    response.send(returndata)
  });
}


function getMovie(lat, lon) {

  const KEY = process.env.MoviKEY;
  let url=`https://api.themoviedb.org/3/movie/550?api_key=${KEY}`;
  

  return superagent.get(url)
    .then(dataMovie => {

      let arr = [];
      datatrials.body.trails.map(element => {
        let newTrial = new Trials(element);
        arr.push(newTrial);
        return arr;
      })

      return arr
    })

}




//route 5
// http://localhost:3000/yelp?city=amman

app.get('/yelp', handelylep);

function handelylep(request, response) {
  let lat = request.query.latitude;
  let lon = request.query.longitude;

  getYelp(lat,lon).then(returndata => {
    response.send(returndata)
  });
}


function getYelp(lat, lon) {

  let url=`https://api.yelp.com/v3/businesses/search?term=restaurants&latitude=${lat}&longitude=${lon}&limit=5&offset=${offset}`;
  
  return superagent.get(url)
    .then(datayelp => {

      let arr = [];
      datayelp.body.map(element => {
        let newYelp = new Yelp(element);
        arr.push(newYelp);
        return arr;
      });

      return arr
    });

}


*/

//Location constroctur 
function Location(city, data) {
  this.search_query = city;
  this.formatted_query = data[0].display_name;
  this.latitude = data[0].lat;
  this.longitude = data[0].lon;
}



//weather constroctur 
// let arrayWeather=[];
function Weather(data) {
  this.forecast = data.weather.description;
  this.time = data.valid_date;
  // arrayWeather.push(this)
  // this.time = new Date(data.valid_date).toDateString();
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


/*
[
  {
    "title": "Sleepless in Seattle",
    "overview": "A young boy who tries to set his dad up on a date after the death of his mother. He calls into a radio station to talk about his dad’s loneliness which soon leads the dad into meeting a Journalist Annie who flies to Seattle to write a story about the boy and his dad. Yet Annie ends up with more than just a story in this popular romantic comedy.",
    "average_votes": "6.60",
    "total_votes": "881",
    "image_url": "https://image.tmdb.org/t/p/w500/afkYP15OeUOD0tFEmj6VvejuOcz.jpg",
    "popularity": "8.2340",
    "released_on": "1993-06-24"
  },
  {
    "title": "Love Happens",
    "overview": "Dr. Burke Ryan is a successful self-help author and motivational speaker with a secret. While he helps thousands of people cope with tragedy and personal loss, he secretly is unable to overcome the death of his late wife. It's not until Burke meets a fiercely independent florist named Eloise that he is forced to face his past and overcome his demons.",
    "average_votes": "5.80",
    "total_votes": "282",
    "image_url": "https://image.tmdb.org/t/p/w500/pN51u0l8oSEsxAYiHUzzbMrMXH7.jpg",
    "popularity": "15.7500",
    "released_on": "2009-09-18"
  },
  ...
]

*/
//Movies constroctur 
function Movies(data) {
  this.title = data.name;
  this.overview = data.location;
  this.star_votes = data.star_votes;
  this.total_votes = data.trail_url;
  this.image_url = data.conditions;
  this.popularity = trail.conditionDate.split(" ")[0];
  this.released_on = trail.conditionDate.split(" ")[1];

}



//Yelp constroctur 
function Yelp(data) {
  this.name = data.name;
  this.image_url = data.image_url;
  this.price = data.businesses.price;
  this.rating =data.businesses.rating;
  this.url = data.url;

}







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

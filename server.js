'use strict'

require('dotenv').config();
const server = require('express');
const cors = require('cors');
const { request, response } = require('express');
const app = server();
const superagent = require('superagent');
app.use(cors());

const PORT = process.env.PORT || 3000;


app.listen(PORT, () => {
  console.log('Server is listening to port ', PORT);
});


//home page
app.get('/', (request, response) => {
  response.status(200).send('Home page')
});



//route 1
// http://localhost:3000/location?city=amman

app.get('/location', handelLoc);

function handelLoc(request, response) {
  let city = request.query.city;

  getData(city).then(returndata => {
    response.send(returndata)
  });
}

function getData(city) {

  let key = process.env.APIKEY;
  const idlocation = `https://eu1.locationiq.com/v1/search.php?key=${key}&q=${city}&format=json`;


  return superagent.get(idlocation)
    .then(data => {
      return new Location(city, data.body);
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

  getTrials(lat,lon)
  .then(data => {
    response.send(data)
  });


}


function getTrials(lat,lon) {

  const KEY = process.env.Hiking;
  const url = `https://www.hikingproject.com/data/get-trails?lat=${lat}&lon=${lon}&key=${KEY}`;
  // const url =`https://www.hikingproject.com/data/get-trails-by-id?ids=${id}&key=${KEY}`

console.log(url)
  return superagent.get(url)
    .then(datatrials => {

      let arr = [];
      datatrials.body.trails.map(element => {
        let newTrial = new Trials(element);
        arr.push(newTrial);
        return arr;
      })

      response.send(arr)
    })

}





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
  this.condition_date = trail.conditionDate.split(" ")[0];
  this.condition_time = trail.conditionDate.split(" ")[1];

}







// remain routes
app.all('*', (request, response) => {
  response.status(404).send('Sorry, page not found');
});

// ERORR
app.use((error, request, response, next) => {
  response.status(500).send('Sorry, something went wrong');
})

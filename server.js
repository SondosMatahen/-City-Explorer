'use strict'

const server=require('express');
const cors=require('cors');
const { request, response} = require('express');
require('dotenv').config();

const app=server();
app.use(cors());

const PORT=process.env.PORT||3200 ;

//home page
app.get('/',(request,response)=>{
    response.status(200).send('Home page')
});



//route 1
// http://localhost:3200/location?city=amman
app.get('/location',(request,response)=>{
 
const data = require('data/location.json');
let city=request.query.city;
let newLoc = new Location(city ,data);
response.send(newLoc);
});


//route 2
// http://localhost:3200/weather?city=amman
// app.get('/weather',(request,response)=>{
 
//   const data = require('./data/weather.json');
//   //let city=request.query.city;
//   let newWeather = new Weather(data);
//   response.send(newWeather);
//   });

/*
[
  {
    "forecast": "Partly cloudy until afternoon.",
    "time": "Mon Jan 01 2001"
  },
  {
    "forecast": "Mostly cloudy in the morning.",
    "time": "Tue Jan 02 2001"
  },
  ...
]


*/

function Location (city,data){
    this.search_query=city;
    this.formatted_query=data[0].display_name;
    this.latitude=data[0].lat;
    this.longitude=data[0].lon;
}

// function Weather (data){
//   this.search_query=city;
//   this.formatted_query=data[0].display_name;
//   this.latitude=data[0].lat;
//   this.longitude=data[0].lon;
// }


// remain routes
app.all('*', (request, response) =>{
    response.status(404).send('page not found');
  });
  

app.listen(PORT, ()=>{
    console.log('Server is listening to port ', PORT);
  });
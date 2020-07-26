'use strict'

require('dotenv').config();
const server=require('express');
const cors =require('cors');
const { request, response } = require('express');
const app=server();
app.use(cors());

const PORT=process.env.PORT||3000 ;


app.listen(PORT, ()=>{
  console.log('Server is listening to port ', PORT);
});


//home page
app.get('/',(request,response)=>{
    response.status(200).send('Home page')
});



//route 1
// http://localhost:3200/location?city=amman
app.get('/location', (request,response, next)=>{
 
const data = require('./data/location.json');
let city=request.query.city;
try {
  if (!city) throw new Error();
  if (!isNaN(city)) throw new Error();
} catch(err) {
  next(err);
}
let newLoc = new Location(city ,data);
response.send(newLoc);
});


//route 2
// http://localhost:3200/weather?city=amman
app.get('/weather',(request,response)=>{
 
  const weather = require('./data/weather.json');
  
  const data=weather.data;
  data.forEach((element,index)=>{
    let newWeather = new Weather(data , index);
  });
  response.send(arrayWeather);
  });




function Location (city,data){
    this.search_query=city;
    this.formatted_query=data[0].display_name;
    this.latitude=data[0].lat;
    this.longitude=data[0].lon;
}



let arrayWeather=[];

function Weather (data,index){
  this.forecast=data[index].weather.description;
  this.time=data[index].datetime;
  arrayWeather.push(this)
}



// remain routes
app.all('*', (request, response) =>{
    response.status(404).send('Sorry, page not found');
  });

  // ERORR

  app.use((error ,request,response,next)=>{
    response.status(500).send('Sorry, something went wrong');
  })

'use strict';
require('dotenv').config();


// Application Dependencies
const express = require('express');
const superagent  = require('superagent');
const cors = require('cors');


// Application Setup
const app = express();
const PORT = process.env.PORT || 3434;


// Application Middleware
app.use(express.static('./public'));
app.use(cors());
app.use(express.urlencoded({ extended: true }));


// Set the view engine for server-side templating
app.set('view engine','ejs');
app.get('/hello',homePage);
// app.get('/',homePage);


function homePage(req,res){
  res.render('pages/index');
}


// Catch-all-errors
app.get('*',(req,res)=>{
  res.status(404).send('something went wrong');
});

app.listen(PORT,()=>{
  console.log(`listening on PORT ${PORT}`);
});

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
// app.get('/hello',homePage);
app.get( `/searches/new`,showForm);
app.get('/',homePage);
app.post('/searches',createSearch);



function homePage(req,res){
  res.render('pages/index');
}

function showForm(req,res){
  res.render('pages/searches/new.ejs');
}


//Constrecter
function Book(info) {
  this.title = info.title;
  this.author = info.authors || 'Authors';
  this.description = info.description;
  this.thumbnail = 'https://i.imgur.com/J5LVHEL.jpg';
  // this.thumbnail = (info.imageLinks.thumbnail)? info.imageLinks.thumbnail : 'https://i7.uihere.com/icons/829/139/596/thumbnail-caefd2ba7467a68807121ca84628f1eb.png';
}

function createSearch(req,res){

  let url = 'https://www.googleapis.com/books/v1/volumes';
  console.log(req.body);
  const searchBy = req.body.searchBy;
  const searchValue = req.body.search;
  const query = {};
  if (searchBy === 'title') {
    query['q'] = `intitle:'${searchValue}'`;

  } else if (searchBy === 'author') {
    query['q'] = `inauthor:'${searchValue}'`;
  }
  console.log(searchValue);
  // send the URL to the servers API
  console.log(query);
  superagent.get(url).query(query).then(search => {
    return search.body.items.map(searchBook => new Book(searchBook.volumeInfo));
  }).then(results => {
    res.render('pages/searches/show', { searchResults: results });
  }).catch((error) => {
    console.error('ERROR', error);
    res.status(500).render('pages/error');
  });
}



// Catch-all-errors
app.get('*',(req,res)=>{
  res.status(404).send('something went wrong');
});

app.listen(PORT,()=>{
  console.log(`listening on PORT ${PORT}`);
});

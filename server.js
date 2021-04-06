'use strict';
require('dotenv').config();


// Application Dependencies
const express = require('express');
const superagent  = require('superagent');
const cors = require('cors');
const pg = require('pg');


//client Obj
// const client = new pg.Client(process.env.DATABASE_URL);


// Application Setup
const app = express();
const PORT = process.env.PORT || 4444;
const DATABASE_URL= process.env.DATABASE_URL;
const ENV = process.env.ENV || 'DEP';
// Application Middleware
app.use(express.static('./public'));
app.use(cors());
app.use(express.urlencoded({ extended: true }));


let client = '';
if (ENV === 'DEP') {
  client = new pg.Client({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });
} else {
  client = new pg.Client({
    connectionString: DATABASE_URL,
  });
}

// Set the view engine for server-side templating
app.set('view engine','ejs');
// app.get('/hello',homePage);
app.get( `/searches/new`,showForm);
app.get('/',homePage);
app.post('/searches',createSearch);
app.get('/books/:id',getBookDetail);
app.post('/books',saveBook);

function homePage(req,res){
  const selectQuuery = 'SELECT * FROM tasks;';
  client.query(selectQuuery).then(result=>{
    res.render('pages/index',{result: result.rows});
  }).catch(error=>{
    handleError(error, res);
  });
}

function showForm(req,res){
  res.render('pages/searches/new.ejs');
}


function getBookDetail(req,res){
  const bookId = req.params.id;
  const sqlQuery = 'SELECT * FROM tasks WHERE id=$1';
  const saveValus = [bookId];
  client.query(sqlQuery,saveValus).then(results=>{
    res.render('pages/books/detail.ejs',{results:results.rows});
  }).catch(error=>{
    handleError(error, res);
  });
}


function saveBook(req, res){
  const {auther, title, isbn,image_url, description}=req.body;
  const sqleSave = [auther, title, isbn,image_url, description];
  const sqlQuery = 'INSERT INTO tasks (auther, title, isbn, image_url, description ) VALUES($1, $2, $3, $4, $5) RETURNING id;'; //RETURNING any inserting value
  client.query(sqlQuery, sqleSave).then((result)=>{
    res.redirect(`/books/${result.rows[0].id}`);
  }).catch(error=>{
    handleError(error, res);
  });
}


//Constrecter
function Book(info) {
  this.title = info.title?info.title:'Title was Found';
  this.author = info.authors ? info.authors[0] :'Authors Were Found';
  this.description = info.descriptio?info.description:'Description Not Found';
  this.thumbnail = info.imageLinks? info.imageLinks.thumbnail : 'https://i.imgur.com/J5LVHEL.jpg';
  this.isbn = info.industryIdentifiers ? `ISBN_13 ${info.industryIdentifiers[0].identifier}` : 'No ISBN available';
}

function createSearch(req,res){

  let url = 'https://www.googleapis.com/books/v1/volumes';
  // console.log(req.body);
  const searchBy = req.body.searchBy;
  const searchValue = req.body.search;
  const query = {};
  if (searchBy === 'title') {
    query['q'] = `intitle:'${searchValue}'`;

  } else if (searchBy === 'author') {
    query['q'] = `inauthor:'${searchValue}'`;
  }
  // console.log(searchValue);
  // send the URL to the servers API
  // console.log(query);
  superagent.get(url).query(query).then(search => {
    return search.body.items.map(searchBook => new Book(searchBook.volumeInfo));
  }).then(results => {
    res.render('pages/searches/show', { searchResults: results });
  }).catch((error) => {
    handleError(error, res);
  });
}

function handleError(error, res) {
  res.render('pages/error', { error: error });
}

client.connect().then(()=>{
  app.listen(PORT,()=>{
    console.log(`listening on PORT ${PORT}`);
  });

});

// app.listen(PORT,()=>{
//   console.log(`listening on PORT ${PORT}`);
// });





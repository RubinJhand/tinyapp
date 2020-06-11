const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; //default port 8080

app.set('view engine', 'ejs');


app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

const generateRandomString = () => {
  //Google search led to this: NOT MY IDEA (I did not come up with this)
  //Source:
    //http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript

  //apparently not ideal for real world, but for my purposes, should work; change (2, 15) to (2, 5);
 return Math.random().toString(36).substring(2, 5) + Math.random().toString(36).substring(2, 5).toUpperCase();
};


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "1234"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "1234"
  }
};

//renders my urls page (urls index)
app.get('/urls', (req, res) => {
  const userID = req.cookies['user_id'];
  let templateVars = {
    urls: urlDatabase, user: users[userID]
  };
  res.render('urls_index', templateVars);
});
//renders create new url page
app.get('/urls/new', (req, res) => {
  const userID = req.cookies['user_id'];
  let templateVars = {
    urls: urlDatabase, user: users[userID]
  };

  res.render('urls_new', templateVars);
});
//regristration page
app.get('/register', (req, res) => {
  const userID = req.cookies['user_id'];
  let templateVars = {
    urls: urlDatabase, user: users[userID]
  };

  res.render('register', templateVars);
});
//renders edit page
app.get('/urls/:shortURL', (req, res) => {

  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
    const userID = req.cookies['user_id'];

  let templateVars = {
    shortURL,
    longURL,
    user: users[userID]
  };
  res.render('urls_show', templateVars);
});
//redirects any request to /u/:shortURL to its longURL
app.get('/u/:shortURL', (req, res) => {

  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  

  res.redirect(longURL);
});
//creates tinyURL and redirects; adds to urlDatabase
app.post('/urls', (req, res) => {
  
  console.log(req.body);
  //generate shortURL
  const genShortURL = generateRandomString();
  const longURL = req.body.longURL;
 
  urlDatabase[genShortURL] = longURL;
 
  res.redirect(`/urls/${genShortURL}`);
});

app.post('/login', (req, res) => {
  const username = req.body.username;

  res.cookie('username', username);
  res.redirect('/urls'); 
});
//clears cookies, logs out, redirect to /urls
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});
//registers user
app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const id = generateRandomString();

  users[id] = {
    id,
    email,
    password
  }

  res.cookie('user_id', id);
  res.redirect('/urls');
});
//deletes entry to urlDatabase, redirects to /urls
app.post('/urls/:shortURL/delete', (req, res) => {

  const shortURL = req.params.shortURL;

  delete urlDatabase[shortURL];
  //redirects user after delete
  res.redirect('/urls'); 
});
//redirect to edit page
app.post('/urls/:shortURL', (req, res) => {

  const shortURL = req.params.shortURL;
  
  res.redirect(`/urls/${shortURL}`); 
});
//updates user entered url in edit page, redirects to /urls
app.post('/urls/:shortURL/edit', (req, res) => {

  const updatedURL = req.body.updatedURL;
  const shortURL = req.params.shortURL;
  
  urlDatabase[shortURL] = updatedURL;

  res.redirect('/urls'); 
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`TinyApp listening to port ${PORT}!`);
});


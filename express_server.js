const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const PORT = 8080; //default port 8080

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//sending variables to EJS template (must be object)
app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase
  };
  //pass data to ejs (file, data): ('urls_index', templateVars)
  res.render("urls_index", templateVars);
});
//new needs to be defined before :shortURL; takes precedence; routes should be ordered from most specific to least specific
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  res.send("Ok"); // Respond with 'Ok'
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];

  let templateVars = {
    shortURL,
    longURL
  };
  res.render("urls_show", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening to port ${PORT}!`);
});


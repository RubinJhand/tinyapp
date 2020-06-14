//Search for entered user email
const getUserByEmail = (usersObject, enteredUserEmail) => {
  for (let user in usersObject) {
    if (usersObject[user].email === enteredUserEmail) {
      return usersObject[user];
    };
  };
  return false;
};
//Returns urls which the user entered
const urlsForUser = (id, urlDatabase) => {
  const xURLs = {};
  for (let tinyURL in urlDatabase) {
    const shortURLID = urlDatabase[tinyURL];
    if (shortURLID.userID === id) {
       xURLs[tinyURL] = shortURLID.longURL;
    };
  };
  return xURLs;
};
//Generates random six character alpha-numeric string
  //Source of code: http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
const generateRandomString = () => {
 return Math.random().toString(36).substring(2, 5) + Math.random().toString(36).substring(2, 5).toUpperCase();
};
//Renders template variables for entered site
const renderTemplateVariables = (req, res, urlDatabase, usersObject, site) => {
  const userID = req.session.user_id;
  let templateVars = { urls: urlDatabase, user: usersObject[userID] };
  res.render(`${site}`, templateVars);
};
//Removes all session cookies from browser then redirects to /urls
const eradicateCookies = (req, res) => {
  req.session = null;
  res.redirect('/urls');
};
//Creates hashed cookie and redirects to /urls
const creatCookie = (req, res, userIdentity) => {
  req.session.user_id = userIdentity;
  res.redirect('/urls');
};
//Returns: email, password
const  emailPasswordReq = (req) => {
  return { email: req.body.email, password: req.body.password };
};
//Returns: shortURL, longURL, userID
const shortLongURLReq = (req) => {
 return { shortURL: req.params.shortURL, longURL: req.body.longURL };
};

const userIDCheck = (req, usersObject) => {
  const userID = req.session.user_id;
  for (let user in usersObject) {
    if (userID === user) {
      return true;
    }
  }  return false;
};

module.exports = { 
  getUserByEmail, 
  urlsForUser, 
  generateRandomString, 
  renderTemplateVariables, 
  eradicateCookies, 
  creatCookie, 
  emailPasswordReq,
  shortLongURLReq,
  userIDCheck
};
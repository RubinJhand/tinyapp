const { bodyParser, bcrypt, morgan, cookieSession, app, PORT, urlDatabase, users } = require('./constRequires');
const { getUserByEmail, generateRandomString, urlsForUser, renderTemplateVariables, eradicateCookies, creatCookie, emailPasswordReq, shortLongURLReq, userIDCheck } = require('./helpers')

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));
app.use(cookieSession( {
  name:'session',
  keys: ['key1', 'key2']
}));

app.get('/', (req, res) => {
  if (userIDCheck(req, users)) {
   res.redirect('/urls'); 
  } else {
    res.redirect('/login');
  };
});

app.get('/urls', (req, res) => {
  if (!userIDCheck(req, users)) {
    res.redirect('/login');
  } else {
  renderTemplateVariables(req, res, urlsForUser(req.session.user_id, urlDatabase), users, 'urls_index');
  };
});

app.get('/urls/new', (req, res) => {
  if (!userIDCheck(req, users)) {
    res.redirect('/login');
  } else {
    renderTemplateVariables(req, res, urlDatabase, users, 'urls_new');
  };
});

app.get('/register', (req, res) => {
  if (!userIDCheck(req, users)) {
    renderTemplateVariables(req, res, urlDatabase, users, 'register');
  } else {
    res.redirect('/urls');
  };
});

app.get('/login', (req, res) => {
  if (userIDCheck(req, users)) {
    res.redirect('/urls');
  } else {
    renderTemplateVariables(req, res, urlDatabase, users, 'login');
  };
});

app.get('/urls/:shortURL', (req, res) => {
  const userID = req.session.user_id;
  const { shortURL } = shortLongURLReq(req);
  if (!userIDCheck(req, users)) {
    res.redirect('/login');
  } else if (userID === urlDatabase[shortURL].userID) {
    const longURL = urlDatabase[shortURL].longURL;
    let templateVars = { shortURL, longURL, user: users[userID] };
    res.render('urls_show', templateVars);
  } else {
    res.status(404).send('shortURL - longURL mismatch! Try again');
  };
});

app.get('/u/:shortURL', (req, res) => {
  const { shortURL } = shortLongURLReq(req);
  if (urlDatabase[shortURL]) {
    const longURL = urlDatabase[shortURL].longURL;
    if (longURL === undefined) {
      res.status(302);
    } else {
      res.redirect(longURL);
    }
  } else {
    res.status(404).send('shortURL - longURL mismatch! Try again');
  }
});

app.post('/urls', (req, res) => {
  const userID = req.session.user_id;
  const { longURL } = shortLongURLReq(req);
  const generatedShortURL = generateRandomString();
  urlDatabase[generatedShortURL] = { longURL, userID };
  res.redirect(`/urls/${generatedShortURL}`);
});

app.post('/login', (req, res) => {
  const { email, password } = emailPasswordReq(req);
  const user = getUserByEmail(users, email);
  if (!user) {
    res.status(403).send('email not found');
  } else if (!bcrypt.compareSync(password, user.cryptPassword)) {
    return res.status(403).send('password does not match');
  } else {
    creatCookie(req, res, user.id);
  };
});

app.post('/logout', (req, res) => {
  eradicateCookies(req, res);
});

app.post('/register', (req, res) => {
  const { email, password } = emailPasswordReq(req);
  if (email === '') {
    return res.status(400).send('enter email');
  } else if (getUserByEmail(users, email)) {
    return res.status(400).send('email address exists, try a different one');
  } else {
    const cryptPassword = bcrypt.hashSync(password, 10);
    const id = generateRandomString();
    users[id] = { id, email, cryptPassword };
    creatCookie(req, res, id);
  };
});

app.post('/urls/:shortURL', (req, res) => {
  if (!userIDCheck(req, users)) {
    res.redirect('/login');
  } else {
    const { shortURL } = shortLongURLReq(req);
    res.redirect(`/urls/${shortURL}`); 
  };
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const { shortURL } = shortLongURLReq(req);
  const userID = req.session.user_id;
  const user = urlDatabase[shortURL].userID;
  if (userID === user) {
    delete urlDatabase[shortURL];
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  };
});

app.post('/urls/:shortURL/edit', (req, res) => {
  const { shortURL } = shortLongURLReq(req);
  const updatedURL = req.body.updatedURL;
  urlDatabase[shortURL].longURL = updatedURL;
  res.redirect('/urls'); 
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`TinyApp listening to port ${PORT}!`);
});
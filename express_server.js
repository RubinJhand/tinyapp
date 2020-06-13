const { bodyParser, bcrypt, morgan, cookieSession, app, PORT, urlDatabase, users } = require('./dependentFunctions');
const { getUserByEmail, generateRandomString, urlsForUser, renderTemplateVariables, eradicateCookies, creatCookie, reqContainer } = require('./helpers')

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));
app.use(cookieSession( {
  name:'session',
  keys: ['key1', 'key2']
}));

app.get('/', (req, res) => {
  const { userID } = reqContainer(req);
  if (userID) {
   res.redirect('/urls'); 
  } else {
    res.redirect('login');
  }
});

app.get('/urls', (req, res) => {
  renderTemplateVariables(req, res, urlsForUser(req.session.user_id, urlDatabase), users, 'urls_index');
});

app.get('/urls/new', (req, res) => {
  const { userID } = reqContainer(req);
  if (!userID) {
    return res.redirect('/login');
  } else {
    renderTemplateVariables(req, res, urlDatabase, users, 'urls_new');
  };
});

app.get('/register', (req, res) => {
  renderTemplateVariables(req, res, urlDatabase, users, 'register');
});

app.get('/login', (req, res) => {
  renderTemplateVariables(req, res, urlDatabase, users, 'login');
});

app.get('/urls/:shortURL', (req, res) => {
  const { shortURL, userID } = reqContainer(req);
  const longURL = urlDatabase[shortURL].longURL;
  let templateVars = {
    shortURL,
    longURL,
    user: users[userID]
  }
  res.render('urls_show', templateVars);
});

app.get('/u/:shortURL', (req, res) => {
  const { shortURL } = reqContainer(req);
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

app.post('/urls', (req, res) => {
  const { userID, longURL } = reqContainer(req);
  const genShortURL = generateRandomString();
  urlDatabase[genShortURL] = { longURL, userID };
  res.redirect(`/urls/${genShortURL}`);
});

app.post('/login', (req, res) => {
  const { email, password } = reqContainer(req);
  const user = getUserByEmail(users, email);
  if (!user) {
    return res.status(403).send('email not found');
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
  const { email, password } = reqContainer(req);
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

app.post('/urls/:shortURL/delete', (req, res) => {
  const { shortURL, userID } = reqContainer(req);
  const user = urlDatabase[shortURL].userID;
  if (userID === user) {
    delete urlDatabase[shortURL];
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  };
});

app.post('/urls/:shortURL', (req, res) => {
  const { shortURL } = reqContainer(req);
  res.redirect(`/urls/${shortURL}`); 
});

app.post('/urls/:shortURL/edit', (req, res) => {
  const { shortURL } = reqContainer(req);
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
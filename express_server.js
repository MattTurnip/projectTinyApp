// USE THIS CODE TO RUN NODEMON : npm start
const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const PORT = 8080; // default port 8080
app.set("view engine", "ejs"); //set ejs as the view engine
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

//DEFAULT URLS
var urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//DEFAULT USERS
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

//function generate a random string
function generateRandomString() {
  let text = "";
  const letNums =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 6; i++) {
    text += letNums.charAt(Math.floor(Math.random() * letNums.length));
  }
  return text;
}

//function add a new user to user object
function registerUser(email, password) {
  const id = generateRandomString();
  const newUSer = {
    id: id,
    email: email,
    password: password
  };
  users[id] = newUSer;
  return newUSer;
}

//function find if user is in DB
function find(email, password) {
  let userArr = Object.values(users);
  for (let i = 0; i < userArr.length; i++) {
    if (userArr[i].email == email && userArr[i].password == password) {
      return userArr[i].id;
    }
  }
}

//*********GET REQUESTS********

//PAGE REDIRECT FROM / TO NEW
app.get("/", (req, res) => {
  // res.send("Hello!");
  res.redirect("/urls/new");
});

//PAGE JSON OBJECT OF URL DATABASE
app.get("/urls.json", (req, res) => {
  res.json(users);
});

//Login page
app.get("/login", (req, res) => {
  const templateVars = {
    user_id: req.cookies.user_id,
    email: null
  };
  res.render("login", templateVars);
});

//Register Page
app.get("/register", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user_id: null //because there is no user
  };
  res.render("register", templateVars);
});

//Url index page
app.get("/urls", (req, res) => {
  if (!req.cookies.user_id) {
    res.redirect(/login/);
  } else {
    const templateVars = {
      urls: urlDatabase,
      user_id: req.cookies.user_id,
      email: users[req.cookies.user_id]["email"]
    };
    res.render("urls_index", templateVars);
  }
});

//New TinyUrl page
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user_id: req.cookies.user_id,
    email: users[req.cookies.user_id]["email"]
  };
  res.render("urls_new", templateVars);
});

//Edit specific longURL
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user_id: req.cookies.user_id,
    email: users[req.cookies.user_id]["email"]
  };
  res.render("urls_show", templateVars);
});

//Redirect to page
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//*********POST REQUESTS********

//POST GENERATE RANDOM STRING LENGTH 6
app.post("/urls", (req, res) => {
  if (true) {
    let key = generateRandomString();
    urlDatabase[key] = req.body.longURL;
    res.redirect(`/urls/${key}`);
  }
});

// POST LOGOUT
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login/");
});

// POST login             **WORKIN HERE!

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const found = find(email, password);
  const id = generateRandomString();
  if (found) {
    res.cookie("user_id", found);
    res.redirect("/urls/");
  } else {
    res.redirect("/login/");
  }
});

//POST register endpoint
app.post("/register", (req, res) => {
  if (req.body.email && req.body.password) {
    const email = req.body.email;
    const password = req.body.password;
    const id = registerUser(email, password);
    //if req body email is in users.... you cant register

    //else
    res.cookie("user_id", id["id"]);
    res.redirect("/urls/");
  } else {
    res.status(400);
    res.send("400 status code, Please try filling out the forms!");
  }
});

//POST DELETE URL FROM DATABASE
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

//POST RENAME
app.post("/urls/:shortURL/update", (req, res) => {
  let newName = req.body.longURLRename;
  urlDatabase[req.params.shortURL] = newName;
  res.redirect("/urls");
});

//LISTEN IN PORT
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

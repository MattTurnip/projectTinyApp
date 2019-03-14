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

//FUNCTION GEN RANDOM STRING
function generateRandomString() {
  let text = "";
  const letNums =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 6; i++) {
    text += letNums.charAt(Math.floor(Math.random() * letNums.length));
  }
  return text;
}
//PAGE REDIRECT FROM / TO NEW
app.get("/", (req, res) => {
  // res.send("Hello!");
  res.redirect("/urls/new");
});

//PAGE JSON OBJECT OF URL DATABASE
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//PAGE REGISTER
app.get("/register", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user_id: null //because there is no user
  };
  console.log(templateVars);
  res.render("new_user", templateVars);
});

//PAGE GO TO URL INDEX
app.get("/urls", (req, res) => {
  if (req.cookies.user_id) {
    const templateVars = {
      urls: urlDatabase,
      user_id: req.cookies.user_id,
      email: users[req.cookies.user_id]["email"]
    };
    res.render("urls_index", templateVars);
  } else {
    res.redirect("/register");
  }
});

//PAGE URLS NEW
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user_id: req.cookies.user_id,
    email: users[req.cookies.user_id]["email"]
  };
  res.render("urls_new", templateVars);
});

//PAGE INDIVIDUAL URL WITH EDIT
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user_id: req.cookies.user_id,
    email: users[req.cookies.user_id]["email"]
  };
  res.render("urls_show", templateVars);
});

//PAGE REDIRECT TO ACTUAL SITE
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

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
  res.redirect("/urls/");
});

//POST SET USERNAME COOKIE
// app.post("/login", (req, res) => {
//   console.log("user logged in");
//   res.cookie("user_id", user_id);
//   res.redirect("/urls/");
// });

//POST register endpoint
app.post("/register", (req, res) => {
  if (req.body.email && req.body.password) {
    const email = req.body.email;
    const password = req.body.password;
    const id = generateRandomString();
    users[id] = { id, email, password };
    console.log(users);
    //setting a user_id cookie
    res.cookie("user_id", id);
    //--------------
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

//POST DATABASE -> EDIT PAGE (A BUTTON LINK)              PERHAPS THIS CAN BE REMOVED!!!
app.post("/urls/:id", (req, res) => {
  res.redirect(`/urls/${req.params.id}`);
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

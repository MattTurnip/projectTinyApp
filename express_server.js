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
  b2xVn2: { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" },
  "9sm5xK": "http://www.google.com"
};

//this is the userStoretore
const userStore = {
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

//*********GET REQUESTS********

//PAGE REDIRECT FROM / TO NEW
app.get("/", (req, res) => {
  // res.send("Hello!");
  res.redirect("/urls/new");
});

//PAGE JSON OBJECT OF URL DATABASE
app.get("/users.json", (req, res) => {
  res.json(userStore);
});

//PAGE JSON OBJECT OF URL DATABASE
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
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
    user_id: null //because there is no user
  };
  res.render("register", templateVars);
});

//Url index page
app.get("/urls", (req, res) => {
  if (!req.cookies.user_id) {
    res.redirect(/register/);
  } else {
    const templateVars = {
      urls: urlDatabase,
      user_id: req.cookies.user_id,
      email: userStore[req.cookies.user_id]["email"]
    };
    res.render("urls_index", templateVars);
  }
});

//New TinyUrl page
app.get("/urls/new", (req, res) => {
  if (!req.cookies.user_id) {
    res.redirect("/register/");
  } else {
    const templateVars = {
      user_id: req.cookies.user_id,
      email: userStore[req.cookies.user_id]["email"]
    };
    res.render("urls_new", templateVars);
  }
});

//Edit specific longURL    working
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user_id: req.cookies.user_id,
    email: userStore[req.cookies.user_id]["email"]
  };
  res.render("urls_show", templateVars);
});

//Redirect to page
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

//*********POST REQUESTS********

//POST GENERATE RANDOM STRING LENGTH 6  ***working here
app.post("/urls", (req, res) => {
  let key = generateRandomString();

  urlDatabase[key] = {
    longURL: req.body.longURL,
    userID: req.cookies.user_id
  };
  res.redirect(`/urls/${key}`);
});

// POST LOGOUT
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login/");
});

// POST login
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const existingEmail = checkIfEmailIsInStore(email);
  if (email === existingEmail.email && password === existingEmail.password) {
    res.cookie("user_id", existingEmail.id);
    res.redirect("/urls/");
  } else {
    res.status(403).send("error");
  }
});

//POST register endpoint
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (email && password) {
    const existingEmail = checkIfEmailIsInStore(email);
    if (!existingEmail) {
      const newUser = registerUser(email, password);
      res.cookie("user_id", newUser.id);
      res.redirect("/urls/");
    } else {
      console.log("email taken");
      res.status(400).send("email taken");
    }
  } else {
    res.redirect("/register/");
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
  urlDatabase[req.params.shortURL].longURL = newName;
  res.redirect("/urls");
});

//LISTEN IN PORT
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//Functions

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
  const newUser = {
    id,
    email,
    password
  };
  userStore[id] = newUser;
  return newUser;
}

// //function find if user is in DB
// function authUser(email, password) {
//   const user = findUser(email);
//   if (user.password == password) {
//     return user;
//   }
// }

// function findUser(email) {
//   let userArr = Object.values(userStore);
//   for (let i = 0; i < userArr.length; i++) {
//     if (userArr[i].email == email) {
//       return userArr[i];
//     }
//   }
// }

function checkIfEmailIsInStore(email) {
  for (let userId in userStore) {
    if (userStore[userId].email === email) {
      return userStore[userId];
    }
  }
  return false;
}

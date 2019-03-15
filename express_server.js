const express = require("express");
const app = express();
const cookieSession = require('cookie-session');
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const userStore = {};
const urlDatabase = {};
const PORT = 8080;
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ["here's a secret key, baby!"],
}))

app.get("/", (req, res) => {
  res.redirect("/register");
});

app.get("/users.json", (req, res) => {
  res.json(userStore);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/login", (req, res) => {
  const templateVars = {
    user_id: req.session.user_id,
    email: null
  };
  res.render("login", templateVars);
});

app.get("/register", (req, res) => {
  const templateVars = {
    user_id: null //because there is no user
  };
  res.render("register", templateVars);
});

app.get("/urls", (req, res) => {
  if (!req.session.user_id) {
    res.redirect("register");
  } else {
    const templateVars = {
      urls: urlDatabase,
      user_id: req.session.user_id,
      email: userStore[req.session.user_id]["email"]
    };
    res.render("urls_index", templateVars);
  }
});

app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    res.redirect("/register/");
  } else {
    const templateVars = {
      user_id: req.session.user_id,
      email: userStore[req.session.user_id]["email"]
    };
    res.render("urls_new", templateVars);
  }
});

app.get("/urls/:shortURL", (req, res) => {
  if (req.session.user_id) {
    const templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL,
      user_id: req.session.user_id,
      email: userStore[req.session.user_id]["email"]
    };
    res.render("urls_show", templateVars);
  } else {
    res.status(403).send("can't edit someone else's urls");
  }
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});


app.post("/urls", (req, res) => {
  let key = generateRandomString();
  urlDatabase[key] = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  };
  res.redirect(`/urls/${key}`);
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login/");
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userObject = checkIfEmailIsInStore(email);
  const pwAuth = password && userObject.password && bcrypt.compareSync(password, userObject.password);
  if (email === userObject.email && pwAuth) {
    req.session.user_id = userObject.id;
    res.redirect("/urls/");
  } else {
    res.status(403).send("error");
  }
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  if (email && password) {
    const existingEmail = checkIfEmailIsInStore(email);
    if (!existingEmail) {
      const newUser = registerUser(email, hashedPassword);
      req.session.user_id = newUser.id;
      res.redirect("/urls/");
    } else {
      console.log("email taken");
      res.status(400).send("email taken");
    }
  } else {
    res.redirect("/register/");
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.session.user_id === urlDatabase[req.params.shortURL].userID) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  } else {
    res.status(403).send("Cannot delete someone else's urls");
    console.log("cannot delete");
  }
});

app.post("/urls/:shortURL/update", (req, res) => {
  if (req.session.user_id === urlDatabase[req.params.shortURL].userID) {
    let newName = req.body.longURLRename;
    urlDatabase[req.params.shortURL].longURL = newName;
    res.redirect("/urls");
  } else {
    res.status(403).send("Cannot edit someone else's urls");
    console.log("cannot edit");
  }
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString() {
  let text = "";
  const letNums =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 8; i++) {
    text += letNums.charAt(Math.floor(Math.random() * letNums.length));
  }
  return text;
}

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

function checkIfEmailIsInStore(email) {
  for (let userId in userStore) {
    if (userStore[userId].email === email) {
      return userStore[userId];
    }
  }
  return false;
}

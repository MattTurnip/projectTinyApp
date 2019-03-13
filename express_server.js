// USE THIS CODE TO RUN NODEMON : npm start
const express = require("express");
const app = express();
const cookieParser = require('cookie-parser')
const bodyParser = require("body-parser");
const PORT = 8080; // default port 8080
app.set("view engine", "ejs"); //set ejs as the view engine
app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: true }));



var urlDatabase = {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
};

//generate random string of 6 alphanumeric characters
function generateRandomString() {
    let text = "";
    const letNums = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
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

app.get("/register", (req, res) => {
    res.send("hey there this is a stand in for register")
});

//PAGE GO TO URL INDEX
app.get("/urls", (req, res) => {
    const templateVars = { urls: urlDatabase, username: req.cookies["username"] };
    res.render("urls_index", templateVars);
});

//PAGE URLS NEW
app.get("/urls/new", (req, res) => {
    const templateVars = { username: req.cookies["username"] };
    res.render("urls_new", templateVars);
});

//PAGE INDIVIDUAL URL WITH EDIT
app.get("/urls/:shortURL", (req, res) => {
    const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: req.cookies["username"] };
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

//POST LOGOUT
app.post("/logout", (req, res) => {
    console.log("user logged out");
    res.clearCookie("username");
    res.redirect("/urls/")
});

//POST LOGIN
app.post("/login", (req, res) => {
    console.log("user logged in");
    let username = req.body.username;
    res.cookie("username", username);
    res.redirect("/urls/");
});

//POST DELETE URL FROM DATABASE
app.post("/urls/:shortURL/delete", (req, res) => {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
});

//POST DATABASE -> EDIT PAGE (A BUTTON LINK)
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
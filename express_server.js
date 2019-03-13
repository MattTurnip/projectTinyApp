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

app.get("/", (req, res) => {
    res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
});
//Sending Data to urls_index.ejs
app.get("/urls", (req, res) => {
    const templateVars = { urls: urlDatabase };
    res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
    res.render("urls_new");
});

app.post("/urls", (req, res) => {
    if (true) {
        let key = generateRandomString();
        urlDatabase[key] = req.body.longURL;
        res.redirect(`/urls/${key}`);
    }
});

// upon enter username and press submit route here!
app.post("/login", (req, res) => {
    console.log(req.body.username)
    console.log("hello");
});

//delete url from database. uses the short URL to get here.
app.post("/urls/:shortURL/delete", (req, res) => {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
});

// edit button goes to individual url page that contains edit !
app.post("/urls/:id", (req, res) => {
    res.redirect(`/urls/${req.params.id}`);
});

// longurl edit. uses the short url to get here
app.post("/urls/:shortURL/update", (req, res) => {
    let newName = req.body.longURLRename;
    urlDatabase[req.params.shortURL] = newName;
    res.redirect("/urls");
});

app.get("/urls/:shortURL", (req, res) => {
    const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
    res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
    const longURL = urlDatabase[req.params.shortURL];
    res.redirect(longURL);
});

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});
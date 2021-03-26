var express = require('express');
var mustache = require('mustache-express');

var randomstring = Math.random().toString(36).slice(-15);

const cookieSession = require('cookie-session');


var model = require('./model');
var app = express();

// parse form arguments in POST requests
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));

app.engine('html', mustache());
app.set('view engine', 'html');
app.set('views', './views');

app.get('/', (req, res) => {
    res.render('index');
  });

app.get('/register', (req,res) => {
  res.render('register');
})

app.get('/login',(req,res) =>{
  res.render('login');
});
app.listen(3000, () => console.log('listening on http://localhost:3000'));
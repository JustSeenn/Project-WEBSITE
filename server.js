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

app.use(cookieSession({
  name: 'session',
  secret: randomstring
}));
function is_authentificated(req, res, next) {
  if(req.session.id != undefined) {
    return next();
  }
  res.status(401).send('Authentication required');
}

function can_see (req,res,next) {
  if(req.session.username != undefined) {
    res.locals.authenticated = true;
    res.locals.name  = req.session.name;
    
  }
  return next();
}
app.use(can_see);

app.get('/', (req, res) => {
    res.render('index');
  });

app.get('/register', (req,res) => {
  res.render('register');
})

app.post('/register',(req,res) => {
  req.session.id = model.new_user(req.body.username,req.body.firstname,req.body.lastname,req.body.email, req.body.adress,req.body.password,req.body.avatar, req.body.description);
 
  if(req.session.id == -1){
    res.locals.error = true;
    res.render('register');
  }
  else{
    req.session.username = req.body.username;
    res.redirect('/profil');}
  
})

app.get('/login',(req,res) =>{
  res.render('login');
});

app.post('/login',(req,res) =>{
  // console.log(req.body.username,req.body.password,model.login(req.body.username,req.body.password).id  )
  if(req.body.username !=null && req.body.password != null && model.login(req.body.username,req.body.password) != -1){  
    req.session = model.login(req.body.username,req.body.password);
    req.session.username = req.body.username;
    res.locals.authenticated = true;
    res.render('profil', model.read(req.session.id));
  }else{ res.redirect('/login');}

});

app.get('/profil',(req,res) =>{
  res.render('profil',model.read(req.session.id))
})

app.get('/profil_amis/:id',(req,res) =>{
  res.render('profil',model.read_friend(req.params.id))
})

app.get('/logout',(req,res)=>{
  req.session.username = null;
  res.redirect('/')
})


app.listen(3000, () => console.log('listening on http://localhost:3000'));


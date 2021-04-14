var express = require('express');
var mustache = require('mustache-express');
var model = require('./model');
var app = express();
const multer = require('multer');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const _ = require('lodash');

var randomstring = Math.random().toString(36).slice(-15);

app.use(express.static('PROJET_WEB_S4'));
app.use(express.static('uploads'));
app.use(express.static('pictures'));


// SET STORAGE
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads')
  },
  filename: function (req, file, cb) {
    console.log(req)
    cb(null, file.fieldname + '-' + file.originalname)
  }
})
 
var upload = multer({ storage: storage })




// parse form arguments in POST requests

app.use(bodyParser.urlencoded({ extended: false }));
app.engine('html', mustache());
app.set('view engine', 'html');
app.set('views', './views');



app.use(bodyParser.json());


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

function authenticated(req,res,next){
  if(req.session.username) {
    res.locals.authenticated = true;
    res.locals.name = req.session.name;
  }
  return next();
}

function added(req, res, next) {
  const info = {
    'action-added': {type: 'success', text: "l'Action a bien été ajouté. l'environnement vous remercie"},
  }
  if(req.query.info && req.query.info in info) {
    res.locals.info = info[req.query.info];
  }
  return next();
}
app.use(added);

/*function can_see (req,res,next) {
  if(req.session.username != undefined) {
    res.locals.authenticated = true;
    res.locals.name  = req.session.name;
    
  }
  return next();
}

app.use(can_see);*/ //can_see pareil que authenticated et le code etait déja conditionné avec authenticated
app.use(authenticated);

app.get('/added/:id', (req, res) => {
  model.addUserrActions(req.params.id, req.session.id);
  res.redirect('/profil/?info=action-added');
})

app.get('/', (req, res) => {
  res.render('index',{user : model.allUser(),list_rankActions : model.rankAction(), list_actions : model.allActions()});
  });

app.get('/register', (req,res) => {
  res.render('register');
})

app.post('/register', upload.single('avatar') ,function(req,res,next){
 
  //Use the name of the input field (i.e. "avatar") to retrieve the uploaded file
  
  req.session.id = model.new_user(req.body.username,req.body.firstname,req.body.lastname,req.body.email, req.body.adress,req.body.password, req.file.originalname, req.body.description);
 
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
  //console.log(req.body)
  // console.log(req.body.username,req.body.password,model.login(req.body.username,req.body.password).id  )
  if(req.body.username !=null && req.body.password != null && model.login(req.body.username,req.body.password) != -1){  
    req.session = model.login(req.body.username,req.body.password);
    req.session.username = req.body.username;
    res.locals.authenticated = true;
    res.render('profil', model.read(req.session.id));
  }else{ res.redirect('/');}

});

app.get('/profil',(req,res) =>{
  console.log(model.read(req.session.id))
  res.render('profil',model.read(req.session.id))
})

app.get('/profil_amis/:id',(req,res) =>{
  if(req.params.id == req.session.id) res.redirect('/profil');
  res.locals.isFriend = model.isFriend(req.session.id, req.params.id);
  if(res.locals.isFriend == -1) res.redirect('/');
  res.render('profil_amis',model.read_friend(req.params.id))
})

app.get('/logout',(req,res)=>{
  req.session.username = null;
  res.redirect('/')
})

app.get('/datalist',(req,res) => {
  res.render('DataList',{list_actions : model.allActions()});
})

app.get('/addFriend/:id',(req,res) => { 
  model.addFriend(req.session.id, req.params.id);
  res.redirect('/profil_amis/'+req.session.id);
})
app.get('/uploads/*', (req, res) => {
  res.sendFile(req.url, {root: './'})
});

app.get('/pictures/*', (req, res) => {
  res.sendFile(req.url, {root: './'})
});
app.get('/parameter',(req,res) => {
  res.render('parameter',model.read_friend(req.session.id))
})

app.post('/parameter',(req,res)=>{
  model.update(req.session.id,req.body.username,req.body.firstname,req.body.lastname,req.body.email, req.body.description)
  res.render('profil',model.read(req.session.id))
})
app.listen(3000, () => console.log('listening on http://localhost:3000'));


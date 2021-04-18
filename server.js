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
    //console.log(req)
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
  if(req.session.username) {
    return next();
  }
  else{
    res.redirect('/?info=no-authentify')
  }
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
    'action-added': {type: 'primary', text: "l'Action a bien été ajouté. l'environnement vous remercie"},
    'invalid-register' : {type: 'danger', text: 'formulaire mal rempli veuillez recommencez'},
    'already-existant' :{type :'danger', text : "Désolé l'action choisis existe déja dans vos actions réalisés"},
    'invalid-parameter' :{type :'danger', text : "votre modification n'est pas effective pour cause de mauvais parametre"},
    'valid-parameter' :{type :'success', text : "vos données ont été correctement mis à jour"},
    'valid-register' :{type :'primary', text : "vous avez été correctement enregistré, l'environnement vous souhaite la bienvenue"},
    'no-authentify' :{type :'danger', text : "vous ne pouvez effectué cette action car vous n'êtes pas connecté"},
    'connected' :{type :'info', text : "vous êtes bien connecté"},
    'not-connected' :{type :'danger', text : "mauvais identifiant de connexion"},
    'disconnected' :{type :'success', text : "vous avez bien été déconnecté"},
    'error' :{type :'info', text : "désolé opération impossible pour l'instant réessayer ultérieurement"},
  }
  if(req.query.info && req.query.info in info) {
    res.locals.info = info[req.query.info];
  }
  return next();
}
app.use(added);

app.use(authenticated);


app.get('/', (req, res) => {
  res.render('index',{user : model.allUser(),list_rankActions : model.rankAction(), list_actions : model.allActions()});
  });

app.get('/register', (req,res) => {
  res.render('register');
})

app.post('/register', upload.single('avatar') ,function(req,res,next){
 
  //Use the name of the input field (i.e. "avatar") to retrieve the uploaded file
  console.log(req.body.username,req.body.firstname,req.body.lastname,req.body.email, req.body.adress,req.body.password, req.file.originalname, req.body.description, model.new_user(req.body.username,req.body.firstname,req.body.lastname,req.body.email, req.body.adress,req.body.password, req.file.originalname, req.body.description))
  try{
    req.session.id = model.new_user(req.body.username,req.body.firstname,req.body.lastname,req.body.email, req.body.adress,req.body.password, req.file.originalname, req.body.description);

  }catch{
    res.locals.error = true;
    res.redirect('/?info=invalid-register');
  }
  
  
  if(req.session.id == -1){
    res.locals.error = true;
    res.redirect('/?info=invalid-register');
  }
  else{
    req.session.username = req.body.username;
    res.redirect('/profil/?info=valid-register');}
    
  })

 app.get('/login',(req,res) =>{
   res.render('login');
  });
  
  
  
  
app.post('/login',(req,res) =>{
  var id =  model.login(req.body.username,req.body.password);
  if(id != -1){
    req.session = id;
    req.session.username = req.body.username;
    res.locals.authenticated = true;
    res.redirect('/?info=connected');
  }else{ res.redirect('/?info=not-connected');}

});

app.get('/profil',is_authentificated,(req,res) =>{
  console.log(req.session.id)
  //console.log(model.read(req.session.id))
  res.render('profil',model.read(req.session.id))
})

app.get('/profil_amis/:id',is_authentificated,(req,res) =>{
  if(req.params.id == req.session.id) res.redirect('/profil');
  res.locals.isFriend = model.isFriend(req.session.id, req.params.id);
  if(res.locals.isFriend == -1) res.redirect('/');
  res.render('profil_amis',model.read_friend(req.params.id))
})

app.get('/logout',is_authentificated,(req,res)=>{
  req.session.username = null;
  res.redirect('/?info=disconnected')
})

app.get('/datalist',is_authentificated,(req,res) => {
  res.render('DataList',{list_actions : model.allActions()});
})

app.get('/addFriend/:id',is_authentificated,(req,res) => { 
  var id = model.addFriend(req.session.id, req.params.id);
  if(id=-1){
    res.redirect('/profil/?info=error')
  }
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

app.post('/parameter',is_authentificated,(req,res)=>{
  var id = model.update(req.session.id,req.body.username,req.body.firstname,req.body.lastname,req.body.email, req.body.description)
  if(id == -1){
    res.redirect('/profil/?info=invalid-parameter');
  }
  res.redirect('/profil/?info=valid-parameter');
})

app.get('/added/:id',is_authentificated,(req, res) => {
  var id = model.addUserActions(req.params.id, req.session.id);
  console.log("Add action success :",id,req.params.id, req.session.id )
  if(id == -1){
    res.redirect('/profil/?info=already-existant')
  }
  else {
    res.redirect('/profil/?info=action-added')
  };
})
app.post('/delete_account',(req,res) =>{
  
  res.render('confirm-delete')
})

app.post('/delete_account_valid',(req,res)=>{
  console.log(req.body)
  if(req.body.verification){
    model.deleteUser(req.session.id)
    req.session.username = null;
    res.redirect('/?info=disconnected')
  }else{
    res.render('confirm-delete')
  }
  
})
app.listen(3000, () => console.log('listening on http://localhost:3000'));


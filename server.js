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
  secret: randomstring,
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
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


function isChallenge(req,res,next){
  console.log("Je rentre isChallenge", req.session.id)
  if(model.isChallenge(req.session.id)){
    console.log("isChallenge est valid")
    res.locals.challenge = true;
  }
  return next();
}
function getWinner(req,res,next){
  try{
    var date= new Date();
    var min_initial = parseInt(req.session.dateChallenge.split(":")[1])
    var hour_initial = parseInt(req.session.dateChallenge.split("/")[1])
    var day_initial = parseInt(req.session.dateChallenge.split("/")[0])
    if(day_initial >= date.getDate() && hour_initial >= date.getHours() && min_initial+1 >= date.getMinutes() ){
      req.session.dateChallenge = null
      model.getWinner(req.session.id)
      
    }
    return next()
  }catch{
    return next();
  }
  
  
}

function isAdmin(req,res,next){
  if(req.session.username == 'admin'){
    res.locals.admin = true;
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
    'requestSend' :{type :'success', text : "la requete a bien été envoyé"},
    'actionAdd' :{type :'success', text : "l'action a bien été ajouté"},
    'refuse' :{type :'info', text : "la requete a bien été refusé"},

  }
  if(req.query.info && req.query.info in info) {
    res.locals.info = info[req.query.info];
  }
  return next();
}
app.use(added);
app.use(getWinner)
app.use(authenticated);


app.get('/', (req, res) => {
  res.render('index',{user : model.allUser(),list_rankActions : model.rankAction(), list_actions : model.allActions()});
  });

app.get('/register', (req,res) => {
  res.render('register');
})

app.post('/register', upload.single('avatar') ,function(req,res,next){
 
  //Use the name of the input field (i.e. "avatar") to retrieve the uploaded file
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

app.get('/profil',is_authentificated,isAdmin,isChallenge,(req,res) =>{
  
  res.render('profil',model.read(req.session.id))
})

app.get('/profil_amis/:id',is_authentificated,(req,res) =>{
  if(req.params.id == req.session.id) res.redirect('/profil');
  else{
    res.locals.isFriend = model.isFriend(req.session.id, req.params.id);
    if(res.locals.isFriend == -1) res.redirect('/');
    else res.render('profil_amis',model.read_friend(req.params.id))
  }
  
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
  if(id==-1){
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

app.get('/refuse_Request/:id',(req,res) => {
  model.removeRequest(req.params.id);
  res.redirect('/profil/?info=refuse');
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
 
  if(id == -1){
    res.redirect('/profil/?info=already-existant')
  }
  else {
    res.redirect('/profil/?info=action-added')
  }
})
app.post('/delete_account',(req,res) =>{
  
  res.render('confirm-delete')
})

app.post('/delete_account_valid',(req,res)=>{
  
  if(req.body.verification){
    model.deleteUser(req.session.id)
    req.session.username = null;
    res.redirect('/?info=disconnected')
  }else{
    res.render('confirm-delete')
  }
  
})

app.post('/add_request', (req,res) => {
  model.addRequest(req.session.id,req.body.actionRequest);
  res.redirect('/profil/?info=requestSend');
})

app.post('/add_Action', (req,res) => {
  model.addAction(req.body.description_request,req.body.point_request);
  model.removeRequest(req.body.request_id);
  res.redirect('/datalist/?info=actionAdd')
})

app.get('/propose_challenge/:id', (req,res) => {
  var addChallenge = model.addChallenge(req.session.id, req.params.id)
  console.log(addChallenge)
  res.render('profil',model.read(req.session.id))
})

app.get('/challenge_accepted/:username',(req,res) => {
  
  model.challengeAccepted(req.session.id,req.params.username)
  var dateChallenge = new Date()
  req.session.dateChallenge = dateChallenge.getDate() + "/" + dateChallenge.getHours() + ":" + dateChallenge.getMinutes()
  console.log("into challenge_accepted : ",res.locals.dateChallenge, dateChallenge.getDate() + "/" + dateChallenge.getHours() + ":" + dateChallenge.getMinutes()   )
  res.render('profil',model.read(req.session.id))
})

app.get('/challenge_refused/:id',(req,res) => {
    model.deleteChallenge(id)
    res.locals.challenge = false
    res.render('profil',model.read(req.session.id))
})
app.listen(3000, () => console.log('listening on http://localhost:3000'));


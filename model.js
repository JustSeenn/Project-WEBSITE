"use strict"
const Sqlite = require('better-sqlite3');
//const { count } = require('node:console');
let db = new Sqlite('db.sqlite');



exports.new_user = (username ,firstname , lastname , email,adress,password , avatar, description) => {
  console.log(username ,firstname , lastname , email,adress,password , avatar, description, "model")
  try{
    var date =  new Date();
    var id = db.prepare('INSERT INTO user (username,firstname,lastname,email,adress,password,avatar,description,date) VALUES ( @username, @firstname, @lastname,@email, @adress,@password, @avatar, @description,  @date )').run({username:username,firstname:firstname, lastname:lastname,password:password,email:email,adress:adress,avatar:avatar,description:description,date:date.getDate()}).lastInsertRowid;
    return id;
  }catch{
    return -1
  }
    
  
        /*var date =  new Date();
        var id = db.prepare('INSERT INTO user (username,firstname,lastname,email,adress,password,avatar,description,points,date) VALUES ( @username, @firstname, @lastname,@email, @adress,@password, @avatar, @description, @points, @date )').run({username:username,firstname:firstname, lastname:lastname,password:password,email:email,adress:adress,avatar:avatar,description:description,points:0,date:date.getDate()}).lastInsertRowid;
        return id;
      return -1;
    }*/
  }

exports.login = (username,password) => {
  try{
    var authen = db.prepare('SELECT id from user where username = ? and password = ?').get(username,password);
    if(!authen) return -1;
    return authen;
  }
  catch{
    return -1;
  }
};

exports.read = (id) => {
    try{
      var found = db.prepare('SELECT * FROM user WHERE id = ?').get(id);
      var friend = db.prepare('SELECT id_f as id FROM friends WHERE id_u = ?').all(id) 

      var tab = [];
      for(var i=0 ; i < friend.length ; i++){
         tab[i] = db.prepare('SELECT username FROM user WHERE id = ?').get(friend[i].id) //TODO 
         tab[i].points = db.prepare('SELECT ifnull(sum(points),0.0) as points FROM list_actions as la inner join user_actions as ua on la.id=ua.id_a WHERE id_u = ?;').get(friend[i].id).points
         tab[i].id = friend[i].id
      }   
      //console.log(tab)
      found.friends_name = tab;
      var count_friends = db.prepare('SELECT COUNT(*) as count FROM friends WHERE id_u = ?').get(id)
      found.count_friends = count_friends.count; 
      
      var actions = db.prepare('SELECT descriptions,points,dates FROM list_actions as la inner join user_actions as ua on la.id=ua.id_a WHERE id_u = ?;').all(id)
      found.action = actions;

      var points = db.prepare('SELECT ifnull(sum(points),0) as points FROM list_actions as la inner join user_actions as ua on la.id=ua.id_a WHERE id_u = ?;').get(id)
      found.points = points.points;
      return found;
    }
    catch{
      return -1;
    }
    
  };

  exports.read_friend = (id) => {
    try{
      var found = db.prepare('SELECT * FROM user WHERE id = ?').get(id);
      var points = db.prepare('SELECT ifnull(sum(points),0) as points FROM list_actions as la inner join user_actions as ua on la.id=ua.id_a WHERE id_u = ?;').get(id)
      found.points = points.points;
      var actions = db.prepare('SELECT descriptions,points FROM list_actions as la inner join user_actions as ua on la.id=ua.id_a WHERE id_u = ?;').all(id)
      found.action = actions;
      var count_friends = db.prepare('SELECT COUNT(*) as count FROM friends WHERE id_u = ?').get(id);
      found.count_friends = count_friends.count; 
      return found;
    }
    catch{
      return -1;
    }
    
  };

  exports.allActions = () => {
      var actions = db.prepare("SELECT * FROM list_actions order by points desc").all();
      if(actions.length != 0) return actions;
      else return -1;
  }

  exports.rankAction = ()=>{
    var actions2 =[]
    var number = []
    var number2
    var max = (db.prepare("SELECT count(*) as count  FROM list_actions ").get()).count
    for(var i=0;i<3;i++){
       number2 = Math.floor(Math.random() *  (max-1))
      while(number.includes(number2)){
          number2 = Math.floor(Math.random() * (max-1))
        }
        number[i]=number2
        actions2[i] = db.prepare("SELECT *  FROM list_actions where id = ?").get(number[i]+1);
        actions2.sort(function compare(a,b){
          if(a.points > b.points)
            return -1
          if(a.points < b.points)
            return 1
          return 0
        })
      }

      if(actions2.length != 0) return actions2;
    return -1;  
  }

  exports.allUser = () => {
    var users = db.prepare("SELECT u.id,u.username,ifnull(sum(points),0) as points FROM user as u inner join (list_actions as la inner join user_actions as ua) on la.id=ua.id_a and  u.id = ua.id_u group by u.id order by points desc").all();
    if(users.length != 0) return users;
    else return -1;
  }

  exports.isFriend = (idU, idF) => {
    try{
      var isFriend = db.prepare("SELECT * FROM friends where id_u = ? and id_f = ?").get(idU, idF);
      if(isFriend) return true;
      else return false;
    }
    catch{
      return -1;
    }
  }

  exports.addFriend = (idU, idF) => {
    try{
      var add = db.prepare("INSERT INTO friends (id_u, id_f) VALUES (?, ?)").run(idU, idF);
      var reverseadd = db.prepare("INSERT INTO friends (id_u, id_f) VALUES (?, ?)").run(idF, idU);
    }
    catch{
      return -1;
    }
      
  }

  exports.update = (id,username,firstname,lasname,email,description) =>{
    try{
      var id = db.prepare("update user set username = ?,  firstname = ?, lastname = ?, email = ?, description = ? WHERE id = ?").run(username,firstname,lasname,email,description,id)
      return id;
    }
    catch{
      return -1
    }
  }

  exports.addUserActions = (idA,idU) => {
    try{
      var date =  new Date();
      var month = date.getMonth()*1+1
      var date1 = date.getDate() + "/" + month + "/" + date.getFullYear()
      var id = db.prepare('INSERT INTO user_actions (id_u, id_a, dates) VALUES (?, ?, ?)').run(idU, idA, date1);
      return id;
    }catch{
      return -1;
    }
    
    
  }

  exports.deleteUser = (id) => {
    try{
      var id = db.prepare('DELETE FROM user where id = ?').run(id)
    }
    catch{
      return -1
    }
  }










/*var insert1 =  db.prepare('INSERT INTO user VALUES ( @username, @firstname, @lastname, @password, @avatar, @description, @points, @date )');
    var insert2 =  db.prepare('INSERT INTO friends VALUES (@id_u, @id_f)');
    var insert3 =  db.prepare('INSERT INTO list_actions VALUES ( @descriptions, @points )');
    var insert4 =  db.prepare('INSERT INTO user_actions VALUES (@id_u, @id_a)');*/
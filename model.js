"use strict"
const Sqlite = require('better-sqlite3');
//const { count } = require('node:console');
let db = new Sqlite('db.sqlite');



exports.new_user = (username ,firstname , lastname , email,adress,password , avatar, description) => {
    if(username && firstname && lastname && email && adress && password && avatar && description){
        var date =  new Date();
        var id = db.prepare('INSERT INTO user (username,firstname,lastname,email,adress,password,avatar,description,points,date) VALUES ( @username, @firstname, @lastname,@email, @adress,@password, @avatar, @description, @points, @date )').run({username:username,firstname:firstname, lastname:lastname,password:password,email:email,adress:adress,avatar:avatar,description:description,points:0,date:date.getDate()}).lastInsertRowid;
        return id;
    }else{
      return -1;
    }
  }

exports.login = (username,password) => {
    var authen = db.prepare('SELECT id from user where username = ? and password = ?').get(username,password);
    
    return ( authen ? authen : -1);
};

exports.read = (id) => {
    console.log(id)
    if(id != -1) {
      var found = db.prepare('SELECT * FROM user WHERE id = ?').get(id);
      var friend = db.prepare('SELECT id_f as id FROM friends WHERE id_u = ?').all(id) 

      var tab = [];
      for(var i=0 ; i < friend.length ; i++){
         tab[i] = db.prepare('SELECT username FROM user WHERE id = ?').get(friend[i].id) //TODO 
         tab[i].points = db.prepare('SELECT points FROM user WHERE id = ?').get(friend[i].id).points
         tab[i].id = friend[i].id
      }   
      console.log(tab)
      found.friends_name = tab;
      var count_friends = db.prepare('SELECT COUNT(*) as count FROM friends WHERE id_u = ?').get(id)
      found.count_friends = count_friends.count; 
      
      var actions = db.prepare('SELECT descriptions,points FROM list_actions as la inner join user_actions as ua on la.id=ua.id_a WHERE id_u = ?;').all(id)
      found.action = actions;
      return found;
    } else {
      return null;
    }
  };

  exports.read_friend = (id) => {
    if(id != -1) {
      var found = db.prepare('SELECT * FROM user WHERE id = ?').get(id);

      
      var count_friends = db.prepare('SELECT COUNT(*) as count FROM friends WHERE id_u = ?').get(id)
      found.count_friends = count_friends.count; 
      
      return found;
    } else {
      return null;
    }
  };

  exports.allActions = () => {
      var actions = db.prepare("SELECT * FROM list_actions order by points desc").all();
      if(actions.length != 0) return actions;
      else return null;
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
    var users = db.prepare("SELECT id,username,points FROM user order by points desc").all();
    if(users.length != 0) return users;
    else return null;
  }

  exports.isFriend = (idU, idF) => {
    if(!idU) return false;
    var isFriend = db.prepare("SELECT * FROM friends where id_u = ? and id_f = ?").get(idU, idF);
    if(isFriend) return true;
    else return false;
  }

  exports.addFriend = (idU, idF) => {
    if(idU && idF) {
      var add = db.prepare("INSERT INTO friends (id_u, id_f) VALUES (?, ?)").run(idU, idF);
      var reverseadd = db.prepare("INSERT INTO friends (id_u, id_f) VALUES (?, ?)").run(idF, idU);
    }
  }

  exports.update = (id,username,firstname,lasname,email,description) =>{
    console.log(id,username,firstname,lasname,email,description)
    var id = db.prepare("update user set username = ?,  firstname = ?, lastname = ?, email = ?, description = ? WHERE id = ?").run(username,firstname,lasname,email,description,id)

    return id
  }

  exports.addUserrActions = (idA,idU) => {
    var id = db.prepare('INSERT INTO user_actions (id_u, id_a) VALUES (?, ?)').run(idU, idA);
    return id;
  }










/*var insert1 =  db.prepare('INSERT INTO user VALUES ( @username, @firstname, @lastname, @password, @avatar, @description, @points, @date )');
    var insert2 =  db.prepare('INSERT INTO friends VALUES (@id_u, @id_f)');
    var insert3 =  db.prepare('INSERT INTO list_actions VALUES ( @descriptions, @points )');
    var insert4 =  db.prepare('INSERT INTO user_actions VALUES (@id_u, @id_a)');*/
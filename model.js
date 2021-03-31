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
    
    if(id != -1) {
      var found = db.prepare('SELECT * FROM user WHERE id = ?').all(id);
      var friend = db.prepare('SELECT id_f as id FROM friends WHERE id_u = ?').all(id)
      for(var i=0;i<friend.length;i++){
        found[0].friend_name[i] = db.prepare('SELECT username FROM user WHERE id = ?').all(friend[i].id) //TODO 
      }
      
      console.log(friend, found[0].friend_name,found[0].friend_name)
      var count_friends = db.prepare('SELECT COUNT(*) as count FROM friends WHERE id_u = ?').get(id)
      found[0].count_friends = count_friends.count; 
      return found;
    } else {
      return null;
    }
  };









/*var insert1 =  db.prepare('INSERT INTO user VALUES ( @username, @firstname, @lastname, @password, @avatar, @description, @points, @date )');
    var insert2 =  db.prepare('INSERT INTO friends VALUES (@id_u, @id_f)');
    var insert3 =  db.prepare('INSERT INTO list_actions VALUES ( @descriptions, @points )');
    var insert4 =  db.prepare('INSERT INTO user_actions VALUES (@id_u, @id_a)');*/
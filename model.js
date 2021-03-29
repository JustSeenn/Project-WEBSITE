"use strict"
const Sqlite = require('better-sqlite3');
//const { count } = require('node:console');
let db = new Sqlite('db.sqlite');



exports.new_user = (username ,firstname , lastname , email,adress,password , avatar, description) => {
    console.log(username ,firstname , lastname , email,adress,password , avatar, description)
    if(username && firstname && lastname && email && adress && password && avatar && description){
        
        var date =  new Date();
        var id = db.prepare('INSERT INTO user (username,firstname,lastname,email,adress,password,avatar,description,points,date) VALUES ( @username, @firstname, @lastname,@email, @adress,@password, @avatar, @description, @points, @date )').run({username:username,firstname:firstname, lastname:lastname,password:password,email:email,adress:adress,avatar:avatar,description:description,points:0,date:date.getDate()}).lastInsertRowid;
        console.log(id);
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
    var found = db.prepare('SELECT * FROM user WHERE id = ?').all(id);
    if(found !== undefined) {
      found.firstname = db.prepare('SELECT firstname FROM user WHERE id = ?').all(id);
      found.lastname = db.prepare('SELECT lastname FROM user WHERE id = ?').all(id);
      found.description = db.prepare('SELECT description FROM user WHERE id = ?').all(id);
      found.points = db.prepare('SELECT points FROM user WHERE id = ?').all(id);
      found.avatar = db.prepare('SELECT avatar FROM user WHERE id = ?').all(id);
      var today = new Date();
      found.date = today.getDate() -  db.prepare('SELECT date FROM user WHERE id = ?' ).all(id);
      found.friend = db.prepare('SELECT COUNT(*) FROM friends where id_u = ?').all(id);
      return found;
    } else {
      return null;
    }
  };









/*var insert1 =  db.prepare('INSERT INTO user VALUES ( @username, @firstname, @lastname, @password, @avatar, @description, @points, @date )');
    var insert2 =  db.prepare('INSERT INTO friends VALUES (@id_u, @id_f)');
    var insert3 =  db.prepare('INSERT INTO list_actions VALUES ( @descriptions, @points )');
    var insert4 =  db.prepare('INSERT INTO user_actions VALUES (@id_u, @id_a)');*/
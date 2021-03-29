"use strict"

const fs = require('fs');
const Sqlite = require('better-sqlite3');

let db = new Sqlite('db.sqlite');

var load = function() {

    db.prepare('DROP TABLE IF EXISTS user').run();
    db.prepare('DROP TABLE IF EXISTS friends').run();
    db.prepare('DROP TABLE IF EXISTS list_actions').run();
    db.prepare('DROP TABLE IF EXISTS user_actions').run();

    db.prepare('CREATE TABLE user (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, firstname TEXT, lastname TEXT,email TEXT, adress TEXT, password TEXT, avatar BLOB, description TEXT, points TEXT, date DATE)').run();
    db.prepare('CREATE TABLE friends (id INTEGER PRIMARY KEY AUTOINCREMENT, id_u INTEGER ,id_f INTEGER)').run();
    db.prepare('CREATE TABLE list_actions (id INTEGER PRIMARY KEY AUTOINCREMENT, descriptions TEXT, points INTEGER)').run();
    db.prepare('CREATE TABLE user_actions (id INTEGER PRIMARY KEY AUTOINCREMENT, id_u INTEGER, id_a INTEGER)').run();



    
}
load();

var test = function() {
    console.log(db.prepare("select * from user").all());
}
test();
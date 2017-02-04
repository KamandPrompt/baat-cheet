//setup basic express server
var express = require('express')
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var index = require('./serve/index.js');
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');
app.set('view options', {
    layout: false
});

//routing
app.use('/',index);

//users online
var users = [];

io.on('connection', function(socket) {

	//When client requests for setting username
	socket.on('set username', function(name) {

		//if name is empty(null), do nothing
		if(name == null) {
			return;
		}
		//if username is not taken
		else if(users.indexOf(name) == -1) {
			users.push(name.trim());

			//username is valid so user is set
			socket.emit('user set', name);

			//notify all users (except sender) that user joined
			socket.broadcast.emit('user joined', name);
			socket.username = name;
		}
		//if username is taken
		else {
			socket.emit('user exists', name);
		}
	});

	//When client sends message
	socket.on('Message Request', function(data){

		//if message is valid
		if(data) {

			//display message to all clients in lobby including sender
			io.sockets.emit('Display Message', {msg: data, user: socket.username});
		}
	});

	//When user disconnets remove user from users
	socket.on('disconnect', function() {

		//display to all users (except sender) in room that user left
		socket.broadcast.emit('user left', socket.username);
		var index = users.indexOf(socket.username);
		if(index != -1) {
			users.splice(index, 1);
		}
	});
});

http.listen('3000', function() {
	console.log('listening on *3000');
});

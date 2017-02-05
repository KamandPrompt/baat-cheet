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

//list of rooms and number of users in particular room (default: lobby)
var rooms = [['lobby', 0]];	

io.on('connection', function(socket) {

	//When client requests for setting username
	socket.on('set username', function(name) {
		name = name.trim()

		//if name is empty(null), do nothing
		if(name == null) {
			return;
		}
		//if username is not taken
		else if(users.indexOf(name) == -1) {
			users.push(name);

			//username is valid so user is set
			socket.emit('user set', name);

			//by default, user joins lobby
			socket.join('lobby');
			rooms[0][1]++;

			//notify all users (except sender) that user joined
			socket.broadcast.emit('user joined', {username: name, num_users: rooms[0][1]});
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
		if(data.msg) {
			//display message to all clients in room including sender
			io.sockets["in"](data.room).emit('Display Message', {msg: data.msg, user: socket.username, room: data.room});
		}
	});

	//When client creates room
	socket.on('create room', function(data) {
		data.room_name = data.room_name.trim();

		//if room name is empty, do nothing
		if(data.room_name == null) {
			return;
		}

		var num_rooms = rooms.length

		//check if room exists
		for(var i = 0; i<num_rooms; ++i) {

			//if room name is taken
			if(rooms[i][0] == data.room_name) {
				socket.emit('room exists', data.room_name);
				return;
			}
		}

		//room not taken so insert into room array 
		rooms.push([data.room_name, 1]);
		socket.join(data.room_name);
		io.sockets.emit('room created', data);
		
	});

	//When user requests to join the room
	socket.on('join room', function(room) {
		socket.join(room);

		var num_rooms = rooms.length

		//update number of users in room
		for(var i = 0; i < num_rooms; i++) {
			if(room == rooms[i][0]) {
				rooms[i][1]++;
				break;
			}
		}

		//notify other users in room that someone joined
		sockets["to"](room).broadcast.emit('user join', {username: socket.username, room: room});
	});

	//When user requests to leave the room
	socket.on('leave room', function(room) {
		socket.leave(room);

		var num_rooms = rooms.length;

		//update number of users in room
		for(var i = 0; i < num_rooms; i++) {
			if(room == rooms[i][0]) {
				rooms[i][1]--;

				//if users become 0, destroy/delete the room
				if(rooms[i][1] == 0) {
					io.sockets.emit('destroy room', room);
					rooms.splice(i, 1);
				}
				break;
			}
		}

		//notify other users in room that someone left
		socket["to"](room).broadcast.emit('user left', {username: socket.username, room: room});
	});

	//When user disconnets remove user from users
	socket.on('disconnecting', function() {

		var num_rooms = rooms.length;

		//update number of users in rooms 
		for(var i = 0; i < num_rooms; i++) {
			if(socket.rooms[rooms[i][0]]) {	
				rooms[i][1]--;

				//notify other users in room that user left
				socket["to"](rooms[i][0]).broadcast.emit('user left', {username: socket.username, room: rooms[i][0]});

				//if number of users become 0 in some room, destroy/delete that room
				if(rooms[i][1] == 0 && rooms[i][0] != 'lobby') {
					io.sockets.emit('destroy room', rooms[i][0]);
					rooms.splice(i, 1);
				}
			}
		}

		//remove username from users array
		var index = users.indexOf(socket.username);
		if(index != -1) {
			users.splice(index, 1);
		}
	});
});
http.listen('3000', function() {
	console.log('listening on *3000');
});

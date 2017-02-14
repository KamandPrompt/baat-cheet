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
app.use(function(err,req,res,next){
	console.log(err.stack);
	res.status(500);
});
//users online
var users = [];

//list of rooms and number of users in particular room (default: lobby)
var rooms = [{name: 'lobby', description: 'Central Lobby', num_users: 0}];	

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
			rooms[0].num_users++;

			//notify all users (except sender) that user joined
			socket.broadcast.emit('user joined', {username: name, num_users: rooms[0].num_users});
			socket.username = name;

			for (var i = 1; i < rooms.length; i++) {
				socket.emit('room created other', {room_name: rooms[i].name, description: rooms[i].description});
			}
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
			if(rooms[i].name == data.room_name) {
				socket.emit('room exists', data.room_name);
				return;
			}
		}

		//room not taken so insert into room array 
		rooms.push({name: data.room_name, description: data.description, num_users: 1});
		socket.join(data.room_name);
		socket.emit('room created self', data);
		socket.broadcast.emit('room created other', data);		
	});

	//When user requests to join the room
	socket.on('join room', function(room) {
		socket.join(room.name);

		var num_rooms = rooms.length

		//update number of users in room
		for(var i = 0; i < num_rooms; i++) {
			if(room.name == rooms[i].name) {
				rooms[i].num_users++;
				break;
			}
		}

		//notify other users in room that someone joined
		socket["to"](room.name).broadcast.emit('user join', {username: socket.username, room: room.name});
	});

	//When user requests to leave the room
	socket.on('leave room', function(room) {
		socket.leave(room.name);

		var num_rooms = rooms.length;

		//update number of users in room
		for(var i = 0; i < num_rooms; i++) {
			if(room.name == rooms[i].name) {
				rooms[i].num_users--;

				//if users become 0, destroy/delete the room
				if(rooms[i].num_users == 0) {
					io.sockets.emit('destroy room', room.name);
					rooms.splice(i, 1);
					return;
				}
				break;
			}
		}

		//notify other users in room that someone left
		socket["to"](room.name).broadcast.emit('user left room', {username: socket.username, room: room.name});
	});

	//When user disconnets remove user from users
	socket.on('disconnecting', function() {

		var num_rooms = rooms.length;

		//update number of users in rooms 
		for(var i = 0; i < num_rooms; i++) {
			if(socket.rooms[rooms[i].name]) {	
				rooms[i].num_users--;

				//notify other users in room that user left
				//socket["to"](rooms[i].name).broadcast.emit('user left room', {username: socket.username, room: rooms[i].name});

				//if number of users become 0 in some room, destroy/delete that room
				if(rooms[i].num_users == 0 && rooms[i].name != 'lobby') {
					io.sockets.emit('destroy room', rooms[i].name);
					rooms.splice(i, 1);
				}
			}
		}

		socket.broadcast.emit('user left', {username: socket.username});
			
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

//setup basic express server
var express = require('express')
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var index = require('./serve/index.js');
var port = process.env.PORT || 3000;
http.listen(port,function(){
	console.log("Listening",http.address().port);
});
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

//list of rooms and number of users in particular room (default: lobby)
var rooms = [{name: 'lobby', description: 'Central Lobby', num_users: 0, users: []}];	

io.on('connection', function(socket) {

	//When client requests for setting username
	socket.on('set username', function(name) {
		name = name.trim()

		//if name is empty(null), do nothing
		if(name == "" || name == null) {
			return;
		}
		//if username is not taken
		else if(rooms[0].users.indexOf(name) == -1) {
			rooms[0].users.push(name);

			//username is valid so user is set
			socket.emit('user set', {username: name, online: rooms[0].num_users + 1, online_users: rooms[0].users});

			//by default, user joins lobby
			socket.join('lobby');
			rooms[0].num_users++;

			//notify all users (except sender) that user joined
			socket.broadcast.emit('user joined', {username: name, online: rooms[0].num_users, online_users: rooms[0].users});
			socket.username = name;

			for (var i = 1; i < rooms.length; i++) {
				socket.emit('room created other', {room_name: rooms[i].name, description: rooms[i].description, online: rooms[i].num_users, online_users: rooms[0].users});
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
		rooms.push({name: data.room_name, description: data.description, num_users: 1, users: [socket.username]});
		socket.join(data.room_name);
		socket.emit('room created self', {room_name: data.room_name, description: data.description, online: 1, online_users: [socket.username]});
		socket.broadcast.emit('room created other', {room_name: data.room_name, description: data.description, online_users: [socket.username]});		
	});

	//When user requests to join the room
	socket.on('join room', function(room) {
		socket.join(room.name);

		var num_rooms = rooms.length;
		var num_users;
		let room_index = 0;

		//update number of users in room
		for(var i = 0; i < num_rooms; i++) {
			if(room.name == rooms[i].name) {
				rooms[i].num_users++;
				num_users = rooms[i].num_users;
				rooms[i].users.push(socket.username);
				room_index = i;
				break;
			}
		}

		//update the user's info
		socket.emit('room joined', {name: room.name, online: num_users, online_users: rooms[room_index].users});

		//notify other users in room that someone joined
		socket["to"](room.name).broadcast.emit('user join', {username: socket.username, room: room.name, online: num_users, online_users: rooms[room_index].users});
	});

	//When user requests to leave the room
	socket.on('leave room', function(room) {
		socket.leave(room.name);

		var num_rooms = rooms.length;
		var num_users;
		var room_index = 0;

		//update number of users in room
		for(var i = 0; i < num_rooms; i++) {
			if(room.name == rooms[i].name) {
				rooms[i].num_users--;
				num_users = rooms[i].num_users;
				for( var j = 0; j < rooms[i].users.length; j++){ 
				   if ( rooms[i].users[j] === socket.username) {
				     rooms[i].users.splice(j, 1); 
				     j--;
				   }
				}
				room_index = i;
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
		socket["to"](room.name).broadcast.emit('user left room', {username: socket.username, room: room.name, online: num_users, online_users: rooms[room_index].users});
	});

	//When user disconnets remove user from users
	socket.on('disconnecting', function() {

		var num_rooms = rooms.length;

		//update number of users in rooms 
		for(var i = 0; i < num_rooms; i++) {
			if(socket.rooms[rooms[i].name]) {	
				rooms[i].num_users--;
				var index = rooms[i].users.indexOf(socket.username);
				if(index != -1) {
					rooms[i].users.splice(index, 1);
				}

				//notify other users in room that user left
				//socket["to"](rooms[i].name).broadcast.emit('user left room', {username: socket.username, room: rooms[i].name});

				//if number of users become 0 in some room, destroy/delete that room
				if(rooms[i].num_users == 0 && rooms[i].name != 'lobby') {
					io.sockets.emit('destroy room', rooms[i].name);
					rooms.splice(i, 1);
					i--;
					num_rooms--;
				}
			}
		}

		io.sockets.emit('user left', {username: socket.username});
		io.sockets.emit('update info', rooms);
		
	});
});
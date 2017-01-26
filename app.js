var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');

app.get('/', function(req, res) {
	res.sendFile(path.join(__dirname, 'temp.html'));
});

var users = [];

io.on('connection', function(socket) {

	socket.on('set username', function(name) {
		//username not taken
		if(users.indexOf(name) == -1) {
			users.push(name.trim());
			socket.emit('user set', name);
			socket.username = name;
		}	
		//username taken
		else {
			socket.emit('user exists', name);
		}
	});

	//When user disconnets remove user from users
	socket.on('disconnect', function() {
		var index = users.indexOf(socket.username);
		if(index != -1) {
			users.splice(index, 1);
		}
	});
});

http.listen('3000', function() {
	console.log('listening on *3000');
});

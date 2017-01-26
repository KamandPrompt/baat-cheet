var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');

app.get('/', function(req, res) {
	res.sendFile(path.join(__dirname, 'index.html'));
});

var users = [];

io.on('connection', function(socket) {

	socket.on('set username', function(name) {
		//username not taken
		if(users.indexOf(name) == -1) {
			socket.emit('user set', name);
		}	
		//username taken
		else {
			socket.emit('user exists', name);
		}
	});

});

http.listen('3000', function() {
	console.log('listening on *3000');
});
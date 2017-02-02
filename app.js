var express = require('express')
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var bodyParser = require('body-parser');
var index = require('./serve/index.js');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    'extended':false
}));
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');
app.set('view options', {
    layout: false
});
app.use('/',index);

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

	socket.on('msg', function(data){
		io.sockets.emit('new message', data);
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

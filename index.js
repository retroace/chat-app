
var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static(__dirname));

app.get('/', function(req, res){
	res.sendFile(__dirname+'/page/index.html');
});
var users =0;
io.on('connection', function(socket){
	socket.broadcast.emit('hi');
	console.log('a user connected');

	users++;
	// Counting Users
	console.log("clients: " + users);


	socket.on('disconnect', function(){
		users--;
		console.log('user disconnected');
	});

	// Emitted event on chat form submittion
	socket.on('chat message', function(msg,user){
		socket.broadcast.emit('chat message', msg , user);

	});
});

http.listen(3000, function(){
	console.log('listening on *:3000');
});
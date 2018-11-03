var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static(__dirname));

app.get('/', function(req, res){
	res.sendFile(__dirname+'/page/index.html');
});
var users =0;
var usersDetail = [];
var usersIp = [];
var testIp = [];

io.on('connection', function(socket){
	
	usersIp.push(socket.handshake.headers.host);
	testIp.push(socket.handshake.headers["x-real-ip"]);
	
	socket.on('newUser',function(user){
		socket.username = user;

		socket.broadcast.emit('newUserConnected', user+" has connected to chat");
		usersDetail.push(user);
		io.emit('totalUsers',usersDetail);
		console.log("Users : "+usersDetail);
	});
	
	console.log("usersIp:" + usersIp);
	console.log("testIp:" + testIp);
	
	console.log('a user connected');

	users++;
	// Counting Users
	console.log("clients: " + users);


	socket.on('disconnect', function(user){
		users--;
		console.log('user disconnected '+ socket.username);
		usersDetail.pop(socket.username);
		io.emit('totalUsers',usersDetail);

		if (socket.username != undefined) {
			io.emit('userDisconnected', socket.username+ " has left the chat");
		}
	});

	// Emitted event on chat form submittion
	socket.on('chat message', function(msg,user){
		socket.broadcast.emit('chat message', msg , user);
	});
});

http.listen(3000, function(){
	console.log('listening on *:3000');
});
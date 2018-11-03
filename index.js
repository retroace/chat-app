var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static(__dirname));


app.get('/', function(req, res){
	res.sendFile(__dirname+'/page/index.html');
});

var usersDetail = [];
var totalUser = 0;
var usersIp = [];
var testIp = [];
var roomsDetail = [];

io.on('connection', function(socket){
	var currentRoom = '';
	// console.log(socket);

	// For figuring out the ip address of user
	usersIp.push(socket.handshake.headers.host);
	testIp.push(socket.handshake.headers["x-real-ip"]);
	
	// console.log("usersIp:" + usersIp);
	// console.log("testIp:" + testIp);
	
	socket.on('createRoom',function(room){
		roomsDetail.push(room);
		socket.join(room.name);
		currentRoom = room.name;
	});

	socket.on('action',function(action){
		io.emit('userAction',action);
	});


	socket.on('joinRoom',function(roomCredentials){
		// Verify room credentials with above roomDetail
		var requestedRoom = [];
		
		for (var i = 0; i < roomsDetail.length; i++) {
			if(roomsDetail[i].name == roomCredentials.name)
			{
				requestedRoom.push(roomsDetail[i]);
			}
		}

		if (requestedRoom.length) {
			if (requestedRoom.passKey == '' || requestedRoom.passKey == roomCredentials.passKey) {
				if (currentRoom != '') {
					socket.leave(currentRoom);
				}
				socket.join(room.name);
			}
		}else{
			socket.emit('errorJoiningRoom',"Cannot join room");
		}
	});

	socket.on('newUser',function(user){
		socket.username = user;
		usersDetail.push(user);

		socket.broadcast.emit('newUserConnected', user+" has connected to chat");
		io.emit('totalUsers',usersDetail.length);
		
		console.log("Users : "+usersDetail);
		console.log('a user connected');
	});
	
	

	totalUser++;
	
	// Counting Users
	console.log("clients: " + usersDetail.length);


	socket.on('disconnect', function(user){
		totalUser--;
		
		console.log('user disconnected '+ socket.username);
		
		usersDetail.pop(socket.username);
		io.emit('totalUsers',usersDetail);
		

		if (socket.username != undefined) {
			if (currentRoom = '') {
				io.emit('userDisconnected', socket.username+ " has left the chat");
			}else{
				io.to(currentRoom).emit('userDisconnected', socket.username+ " has left the chat");
			}
		}
	});

	// Emitted event on chat form submittion
	socket.on('chat message', function(msg,user){
		if (currentRoom == "") {
			socket.broadcast.emit('chat message', msg , user);		
		}else{
			socket.broadcast.to(currentRoom).emit('chat message', msg , user);
		}
	});
});

http.listen(3000, function(){
	console.log('listening on *:3000');
});



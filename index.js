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
	console.log(socket.rooms);

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
		var userDetail = {
			id: user.id,
			name: user.name
		};

		socket.id = user;
		socket.username = user;

		usersDetail.push(userDetail);

		socket.broadcast.emit('newUserConnected', socket.username + " has connected to chat");
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
		
		for (var i = 0; i < usersDetail.length; i++) {
			if(usersDetail[i].name == socket.username )
			{
				usersDetail.pop(i);
			}
		}

		var totalUsers = usersDetail.filter(function (el) {
		  return el != null;
		});
		
		usersDetail = totalUsers;
		totalUsers = null;

		io.emit('totalUsers',usersDetail.length);
		

		if (socket.username != undefined) {
			if (currentRoom = '') {
				io.emit('userDisconnected', socket.username+ " has left the chat");
			}else{
				io.to(currentRoom).emit('userDisconnected', socket.username+ " has left the chat");
			}
		}
	});

	// Emitted event on chat form submittion
	socket.on('chat message', function(msg){
		if (currentRoom == "") {
			socket.broadcast.emit('chat message', msg,socket.username);		
		}else{
			socket.broadcast.to(currentRoom).emit('chat message', msg , socket.username);
		}
	});

	socket.on('register',function(user){
		var user = JSON.parse(user);
		socket.username = user.name;
	
		var userIsInArray = false;

		for (var i = 0; i < usersDetail.length; i++) {
			if (usersDetail[i].id == user.id) {
				userIsInArray = true;
			}
		}

		if (userIsInArray == false) {
			usersDetail.push(user);
		}
		
		io.emit('totalUsers',usersDetail.length);
		console.dir(usersDetail);
		console.log('On Register user: detail '+ usersDetail);

	});


});

http.listen(3000, function(){
	console.log('listening on *:3000');
});

	

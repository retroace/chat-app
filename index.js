var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static(__dirname));


app.get('/', function(req, res){
	res.sendFile(__dirname+'/page/index.html');
});

var extra = require("./message.js");

var usersDetail = [];
var totalUser = 0;
var usersIp = [];
var testIp = [];
var roomsDetail = [];
var chatRoom = [];

var globalRoom = {
	id: '1saw-dk2jfie-skjier4',
	name: "global"
};
var users = [];

io.on('connection', (socket) => {
	users.push(socket.id);
	var currentRoom = globalRoom;

	socket.on('message',(msg) => {
		if (socket.rooms.length == undefined) {
			socket.join(currentRoom.id);
		}

		var message = {
			"name": socket.name,
			"message": msg
		}

		if (socket.name != null) {
			socket.broadcast.to(currentRoom.id).emit('chat', message);
			socket.broadcast.to(globalRoom.id).emit('topMessage',socket.name + " has connected");
		}
	});

	socket.on('newUser',function(user){
		var userData = {
			id: user.id,
			name: user.name
		};
		usersDetail.push(userData);
		socket.emit('registered', message);

	});

	socket.on('newRoom',function(room){
		var roomDetail = {
			id: uniqueID(),
			name: room.name,
			password: room.password
		};
		socket.join(id);
		chatRoom.push(roomDetail);
	});
	
	socket.on('joinRoom',function(room){
		var roomDetail = {
			id: uniqueID(),
			name: room.name,
			password: room.password
		};

		// The room user wanted to enter
		var wantedRoom = chatRoom.filter( (item,index) =>{
			if (item.name == room.name) {
				return true;
			}
			return false;
		});

		if (wantedRoom.length == 1) {
			if (wantedRoom.password == '') {
				socket.join(wantedRoom.id);
			}

			if (wantedRoom.password == room.password) {
				socket.join(wantedRoom.id);
			}

		}else if (wantedRoom.length > 1) {
			socket.emit('message', extra.invalidCredential);	
		}
	});

	socket.on('disconnect', function(user){

		io.emit('totalUsers',usersDetail.length);
		io.emit('userHasLeft', user.name+" "+message.userLeave);

		if (socket.username != undefined) {
			if (currentRoom = '') {
				io.to(global.id).emit('userDisconnected', socket.name+ " has left the chat");
			}else{
				io.to(currentRoom.id).to(currentRoom.id).emit('userDisconnected', socket.username+ " has left the chat");
			}
		}
	});

	socket.on('register',(user) => {
		var user = JSON.parse(user);
		socket.name = user.name;
		var userIsInArray = false;

		for (var i = 0; i < usersDetail.length; i++) {
			if (usersDetail[i].id == socket.id) {
				userIsInArray = true;
			}
		}

		if (userIsInArray == false) {
			usersDetail.push(user);
		}
		io.emit('totalUsers',usersDetail.length);
		io.to(global.id).emit('topMessage',socket.name + " has connected")

	});

	socket.on('getChatRooms',() => {
		socket.emit('chatRooms', chatRoom);
	});
});

http.listen(3000, function(){
	console.log('listening on *:3000');
});

	
function uniqueID(){
  function chr4(){
    return Math.random().toString(16).slice(-4);
  }
  return chr4() + chr4() +
    '-' + chr4() +
    '-' + chr4() +
    '-' + chr4() +
    '-' + chr4() + chr4() + chr4();
}
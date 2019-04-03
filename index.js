var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static(__dirname));


app.get('/', function(req, res){
	res.sendFile(__dirname+'/public/index.html');
});

var extra = require("./message.js");

var usersDetail = [];
var totalUser = 0;
var roomsDetail = [];
var chatRoom = [];

var globalRoom = {
	id: '1saw-dk2jfie-skjier4',
	name: "global"
};

var users = [];

io.on('connection', (socket) => {
	users.push(socket.id);
	
	var currentRoom = null;
	
	if (currentRoom == null) {
		currentRoom = globalRoom;
		socket.join(currentRoom.id);
	}


	socket.on('message',(msg) => {
		if (socket.rooms.length == undefined) {
			socket.join(currentRoom.id);
		}

		var message = {
			"name": socket.name,
			"message": msg
		}

		if (socket.name != null) {
			socket.to(currentRoom.id).emit('chat', message);
		}
	});

	socket.on('leaveRoom',(data) => {
		socket.leave(data.id);
		let user = {
			name : socket.name
		};
		socket.to( data.id ).emit('userLeft',user);
		currentRoom = globalRoom.id;
		socket.join(globalRoom.id);
		socket.emit('leaveRoom');
	});

	socket.on('newUser',function(user){
		var userData = {
			id: user.id,
			name: user.name
		};
		socket.username = user.name;
		usersDetail.push(userData);
		socket.emit('registered', message);

	});

	socket.on('newRoom',function(room){
		let roomDetail = {
			id: uniqueID(),
			name: room.name,
			password: room.password
		};

		socket.join(roomDetail.id);
		socket.leave(currentRoom.id);
		currentRoom = roomDetail;
		chatRoom.push(roomDetail);
		
		let hasPassword = (roomDetail.password != undefined && roomDetail.password.length > 1) ? true: false; 
		
		let newRoomDetail = {
			id: roomDetail.id,
			name: room.name,
			password: hasPassword
		};
		
		socket.emit("joinedRoom", newRoomDetail);
		io.emit('newRoom',newRoomDetail);
	});
	
	socket.on('joinRoom',function(room){
		var roomDetail = {
			id: room.id,
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
			wantedRoom = wantedRoom[0];
			if (wantedRoom.password == '' || wantedRoom.password == false) {
				socket.leave(currentRoom.id);
				currentRoom = wantedRoom;
				
				socket.join(wantedRoom.id);
				socket.emit("joinedRoom", wantedRoom);
				let user = {
					name: socket.name
				};
				socket.to( wantedRoom.id ).emit('userJoin',user);
			}else{
				if (wantedRoom.password == room.password) {
					socket.join(wantedRoom.id);
					let newWantedRoom = {
						id: wantedRoom.id,
						name: wantedRoom.name,
						password: true
					};

					socket.emit("joinedRoom", newWantedRoom);
				}
			}
		}else if (wantedRoom.length > 1) {
			if (room.password == '') {
				socket.emit('getPassword',room);	
			}

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
		let chatRooms = chatRoom;
		chatRooms.map((item,index) => {
			if (item.password != undefined) {
				item.password = true;
			}
		});

		socket.emit('chatRooms', chatRooms);
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
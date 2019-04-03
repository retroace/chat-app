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
	
	totalUser++;
	
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
	
	socket.on('newUser',(data) => {
		var userData = {
			id: socket.id,
			name: data.name
		};
		socket.username = data.name;
		usersDetail.push(userData);
		socket.emit('registered', message);
		// Emit All User Name
		let names = JSON.parse(JSON.stringify(usersDetail)).map((item,index) => {
			return item.name;
		});
		
		io.emit('onlineUsers',{
			total: totalUser,
			users: names
		});
	});
	
	socket.on('newRoom',function(room){
		let roomDetail = {
			id: uniqueID(),
			name: room.name,
			password: room.password,
			admin: socket.name
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
	
	socket.on('joinRoom',function(roomData){
		var roomDetail = {
			id: roomData.id,
			name: roomData.name,
			password: roomData.password
		};
		// The room user wanted to enter
		var wantedRoom = chatRoom.filter( (item,index) =>{
			if (item.name == roomData.name) {
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
				if (wantedRoom.password == roomData.password) {
					socket.join(wantedRoom.id);
					currentRoom = wantedRoom;
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
				socket.emit('getPassword',roomData);	
			}
			
			socket.emit('message', extra.invalidCredential);	
		}
	});
	
	socket.on('disconnect', (user) => {
		totalUser--;
		
		let onlineUser = users.filter((item,index) => {
			if(item == socket.id){
				return false;
			}
			return true;
		});
		
		usersDetail = JSON.parse(JSON.stringify(usersDetail)).filter((item,index) => {
			if(item.id == socket.id){ 
				return false; 
			} 
			return true;
		});
		
		users = onlineUser;
		
		io.emit('totalUsers',usersDetail.length);
		if (socket.name != undefined) {
			io.to(currentRoom.id).emit('userDisconnected', {name: socket.name});
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
		io.to(global.id).emit('topMessage',socket.name + " has connected");
	});
	
	socket.on('getChatRooms',() => {
		let clonedChatRoom = JSON.parse(JSON.stringify(chatRoom));
		
		clonedChatRoom.map((item,index) => {
			if (item.password != undefined) {
				item.password = true;
			}
		});
		
		socket.emit('chatRooms', clonedChatRoom);
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
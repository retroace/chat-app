var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static(__dirname));


app.get('/', function(req, res){
	res.sendFile(__dirname+'/public/index.html');
});

var extra = require("./message.js");

var chatUsers = [];
var totalUser = 0;
var chatRoom = [];
var socketUserCount = {
	total : 0,
	room: {

	}
};
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
		
		if(socketUserCount.room[currentRoom.id] > 0)
		{
			socketUserCount.room[currentRoom.id]++;
		}else{
			socketUserCount.room[currentRoom.id] = 1;
		}
	}
	
	socketUserCount.total++;
	
	socket.on('message',(msg) => {
		if (socket.rooms.length == undefined) {
			socket.join(currentRoom.id);
			if(socketUserCount.room[currentRoom.id] > 0)
			{
				socketUserCount.room[currentRoom.id]++;
			}else{
				socketUserCount.room[currentRoom.id] = 1;
			}
		}
		
		var message = {
			"name": socket.name,
			"message": msg,
			action: false
		}
		
		if (socket.name != null) {
			socket.to(currentRoom.id).emit('chat', message);
		}
	});
	socket.on("action", (data) => {
		switch (data.name) {
			case 'beer':
				socket.to(currentRoom.id).emit('action',{name: 'beer'});
				break;
			case 'sayInChat':
				socket.to(currentRoom.id).emit('action',{
					name: 'sayInChat',
					user: socket.name,
					message: data.message
				});
				break;
			default:
				return '';
				break;
		}
	})	
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
		chatUsers.push(userData);
		socket.emit('registered', message);
		
		// Emit All User Name
		let names = JSON.parse(JSON.stringify(chatUsers)).map((item,index) => {
			return item.name;
		});
		
		io.emit('onlineUsers',{
			total: socketUserCount.total,
			users: names
		});
		io.to(global.id).emit('userConnected',{name: socket.name});
	});
	
	socket.on('newRoom',function(room){
		let roomDetail = {
			id: uniqueID(),
			name: room.name,
			password: room.password,
			admin: socket.name
		};
		
		socketUserCount.room[currentRoom.id]--;
		socket.join(roomDetail.id);
		chatRoom.push(roomDetail);
		
		socket.leave(currentRoom.id);
		currentRoom = roomDetail;
		socketUserCount.room[currentRoom.id] = 1;
		
		
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
				socketUserCount.room[currentRoom.id]--;
				socket.leave(currentRoom.id);
				
				currentRoom = wantedRoom;
				socket.join(wantedRoom.id);
				socket.emit("joinedRoom", wantedRoom);
				socketUserCount.room[currentRoom.id]++;
				
				let user = {
					name: socket.name
				};
				
				socket.to( wantedRoom.id ).emit('userJoin',user);
			}else{
				if (wantedRoom.password == roomData.password) {					
					socket.leave(currentRoom.id);
					socketUserCount.room[currentRoom.id]--;
					
					socket.join(wantedRoom.id);
					currentRoom = wantedRoom;
					let newWantedRoom = {
						id: wantedRoom.id,
						name: wantedRoom.name,
						password: true
					};
					socketUserCount.room[currentRoom.id]++;
					
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
		socketUserCount.total--;
		
		let onlineUser = users.filter((item,index) => {
			if(item == socket.id){
				return false;
			}
			return true;
		});
		
		chatUsers = JSON.parse(JSON.stringify(chatUsers)).filter((item,index) => {
			if(item.id == socket.id){ 
				return false; 
			} 
			return true;
		});
		
		users = onlineUser;
		
		io.emit('totalUsers',chatUsers.length);
		if (socket.name != undefined) {
			io.to(currentRoom.id).emit('userDisconnected', {name: socket.name});
		}
	});
	
	socket.on('register',(user) => {
		var user = JSON.parse(user);
		socket.name = user.name;
		var userIsInArray = false;
		
		for (var i = 0; i < chatUsers.length; i++) {
			if (chatUsers[i].id == socket.id) {
				userIsInArray = true;
			}
		}
		
		if (userIsInArray == false) {
			chatUsers.push(user);
		}
		
		io.emit('totalUsers',chatUsers.length);
		io.to(global.id).emit('userConnected',{name: socket.name});
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
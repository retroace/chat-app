// Chat Users Data Format
// {
// 	id: 'userId',
// 	name: 'John Doe',
// 	currentRoom: 'RoomId',
// }
var chatUsers = [];
var onlineUsers = [];

// Online By Room Data Format
// "chatRoomId": {
// 	totalUser: 2,
// 	users: [{id:'userId', name: 'userName' }]
// }

var onlineByRoom = {};
// Chat Rooms Data Format
// {
// 	name: 'RoomOne',
// 	password: 'something',
// 	maxUsers: '4',
// 	admin: "userId",
// 	bannedUsers : [{id: "userIds", time: now()+10hr }]
// }
var chatRooms = [];

var totalUser = 0;
var chatRoom = [];
var socketUserCount = {
	total : 0,
	room: {

	}
};
var usersCountByRoom = {};
var usersByRoom = {};
var globalRoom = {
	id: '1saw-dk2jfie-skjier4',
	name: "global",
	totalUser: 0
};

const filterOutLeftUser = (haystack,removeNeedle) => {
	return haystack.filter( (item,index) => {
		return (item.id == removeNeedle.id) ? false : true;
	});
};

const sendTotalNameAndUser = (room,data,io) => {
	let names = data.filter((item,index) => {
		return (item.name.length > 0) ? true : false;
	}).map((item,index) => {
		return item.name;
	});
	
	io.in(room).emit('onlineUsers',{
		total: names.length,
		users: names
	});
};

const socketConnection = (socket,io) => {
	var currentRoom = globalRoom;
	socketUserCount.total++;
	
	if(usersByRoom[currentRoom.id] == undefined){
		usersByRoom[currentRoom.id] = [];
	}
	
	if(usersCountByRoom[currentRoom.id] == undefined){
		usersCountByRoom[currentRoom.id] = 1;
	}else{
		usersCountByRoom[currentRoom.id]++;
	}
	
	socket.join(currentRoom.id);

	// Socket has been connected 
	let userData = {
		id: socket.id,
		name: '',
		currentRoom: globalRoom
	};
	chatUsers.push(userData);
	
	// User sends chat message
	socket.on('message',(data) => {
		let chatData = {
			name: socket.name,
			message: data
		};

		if(socket.name == undefined){
			socket.emit('unregistered');
		}else{
			io.to(currentRoom.id).emit('chat', chatData);
		}
	});
	
	// User Actions
	socket.on("action", (data) => {
		switch (data.name) {
			case 'beer':
				socket.to(currentRoom.id)
					.emit('action',{
						name: 'beer'
					});
				break;
			case 'sayInChat':
				io.to(currentRoom.id)
					.emit('action',{
						name: 'sayInChat',
						user: socket.name,
						message: data.message
					});
				break;
			default:
				return '';
				break;
		}
	});

	socket.on('error', (error) => {
		console.log(error);
	});
	
	// User Leaves A Room
	socket.on('leaveRoom',(data) => {
		socket.leave(data.id);
		usersByRoom[currentRoom.id] = filterOutLeftUser(usersByRoom[currentRoom.id], socket);
		sendTotalNameAndUser(currentRoom.id,usersByRoom[currentRoom.id],io);
		
		let user = {
			name : socket.name
		};
		// User left the chat notice
		io.in( data.id ).emit('userLeft',user);
		usersCountByRoom[currentRoom.id]--;
		
		// User joins global room
		currentRoom = globalRoom;
		socket.join(globalRoom.id);
		socket.emit('joinedRoom',{
			id: globalRoom.id,
			name: 'Global Room'
		});
		usersByRoom[currentRoom.id].push({
			id: socket.id,
			name: socket.name
		});
		sendTotalNameAndUser(currentRoom.id,usersByRoom[currentRoom.id],io);
		usersCountByRoom[currentRoom.id]++;
		
	});

	// newUser Comes
	socket.on('newUser',(data) => {
		// Initialize user data format
		let userData = {
			id: socket.id,
			name: data.name,
			currentRoom: globalRoom.id
		};
		
		// Set socket name
		socket.name = data.name;
		
		// Push into chat Users
		chatUsers.push(userData);
		usersByRoom[currentRoom.id].push(userData);
		
		// Emit registered user
		socket.emit('registered', message);
		
		// Emit All User Name
		sendTotalNameAndUser(currentRoom.id,usersByRoom[currentRoom.id],io);
		io.to(global.id).emit('userConnected',{name: socket.name});
	});

	// User Creates A New Room
	socket.on('newRoom',function(room){
		let roomDetail = {
			id: uniqueID(),
			name: room.name,
			password: room.password,
			admin: {
				id: socket.id,
				name: socket.name
			}
		};
		usersCountByRoom[currentRoom.id]--;
		usersByRoom[currentRoom.id] = filterOutLeftUser(usersByRoom[currentRoom.id],socket);
		socket.join(roomDetail.id);
		chatRoom.push(roomDetail);
		sendTotalNameAndUser(currentRoom.id,usersByRoom[currentRoom.id],io);
		
		// Change Current room id
		socket.leave(currentRoom.id);
		currentRoom = roomDetail;
		socketUserCount.room[currentRoom.id] = 1;
		
		if(usersByRoom[currentRoom.id] == undefined){
			usersByRoom[currentRoom.id] = [];
		}
		
		if(usersCountByRoom[currentRoom.id] == undefined){
			usersCountByRoom[currentRoom.id] = 1;
		}else{
			usersCountByRoom[currentRoom.id]++;
		}
		
		let hasPassword = (roomDetail.password != undefined && roomDetail.password.length > 1) ? true: false; 
		let newRoomDetail = {
			id: roomDetail.id,
			name: room.name,
			password: hasPassword
		};
		
		socket.emit("joinedRoom", newRoomDetail);
		io.emit('newRoom',newRoomDetail);
		usersByRoom[currentRoom.id].push({
			id: socket.id,
			name: socket.name
		});
		sendTotalNameAndUser(currentRoom.id,usersByRoom[currentRoom.id],io);
	});
	
	// User Wants To Join A Room
	socket.on('joinRoom',function(roomData){
		var roomDetail = {
			id: roomData.id,
			name: roomData.name,
			password: roomData.password
		};
		
		// The room user wanted to enter
		var wantedRoom = chatRoom.filter( (item,index) =>{
			if (item.id == roomData.id) {
				return true;
			}
			return false;
		});
		
		if (wantedRoom.length == 1) {
			wantedRoom = wantedRoom[0];
			
			if (wantedRoom.password == '' || wantedRoom.password == false) {
				socketUserCount.room[currentRoom.id]--;
				socket.leave(currentRoom.id);
				usersByRoom[currentRoom.id] = filterOutLeftUser(usersByRoom[currentRoom.id], socket);
				sendTotalNameAndUser(currentRoom.id,usersByRoom[currentRoom.id],io);
				
				currentRoom = wantedRoom;
				usersByRoom[currentRoom.id].push({
					id: socket.id,
					name: socket.name
				});

				socket.join(wantedRoom.id);
				socket.emit("joinedRoom", wantedRoom);
				
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
					
					socket.emit("joinedRoom", newWantedRoom);
				}else{
					socket.emit("joinRoomError", {message: "Incorrect password"});
				}
			}
			sendTotalNameAndUser(currentRoom.id,usersByRoom[currentRoom.id],io);
		}else{
			socket.on('joinRoomError',roomData);
		}
	});

	// User Leaves Chat
	socket.on('disconnect', (user) => {
		socketUserCount.total--;

		usersCountByRoom[currentRoom.id]--;
		// Filter disconnected user from the room
		usersByRoom[currentRoom.id] = filterOutLeftUser(usersByRoom[currentRoom.id], socket);
		sendTotalNameAndUser(currentRoom.id,usersByRoom[currentRoom.id],io);
		
		let onlineUser = chatUsers.filter((item,index) => {
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
		sendTotalNameAndUser(currentRoom.id,usersByRoom[currentRoom.id],io);
		
		users = onlineUser;
		
		io.emit('totalUsers',usersCountByRoom[currentRoom.id].length);
		if (socket.name != undefined) {
			io.to(currentRoom.id).emit('userDisconnected', {name: socket.name});
		}
	});

	// User wants to get all chat rooms
	socket.on('getChatRooms',() => {
		let clonedChatRoom = JSON.parse(JSON.stringify(chatRoom));
		
		clonedChatRoom.map((item,index) => {
			if (item.password != undefined) {
				item.password = true;
			}
		});
		
		socket.emit('chatRooms', clonedChatRoom);
	});
}

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

module.exports = {  
	socketConnection: socketConnection
}
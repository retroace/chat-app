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
var globalRoom = {
	id: '1saw-dk2jfie-skjier4',
	name: "global",
	totalUser: 0
};

var users = [];

const connected = (data) => {
	
};
var users = [];
const socketConnection = (socket,io) => {
	var currentRoom = globalRoom;
	socketUserCount.total++;
	socketUserCount.room[currentRoom.id]++;
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
		io.to(currentRoom.id).emit('chat', chatData);
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
				socket.to(currentRoom.id)
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

	// User Leaves A Room
	socket.on('leaveRoom',(data) => {
		socket.leave(data.id);
		
		let user = {
			name : socket.name
		};

		// User left the chat notice
		io.in( data.id ).emit('userLeft',user);
		
		// User joins global room
		currentRoom = globalRoom.id;
		socket.join(globalRoom.id);
		socket.emit('joinedRoom',{
			id: globalRoom.id,
			name: 'Global Room'
		});
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
		
		// Emit registered user
		socket.emit('registered', message);
		
		// Emit All User Name
		let names = JSON.parse(JSON.stringify(chatUsers));
		names = names.filter((item,index) => {
			return (item.name.length > 0) ? true : false;
		}).map((item,index) => {
			return item.name;
		});
		
		io.emit('onlineUsers',{
			total: socketUserCount.total,
			users: names
		});
		io.to(global.id).emit('userConnected',{name: socket.name});
	});

	// User registers same as a new User
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

	// User Creates A New Room
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
	
	// User Wants To Join A Room
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

	// User Leaves Chat
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
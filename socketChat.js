class Chat {
	constructor(socket){
		this.socket = socket;
		this.rooms = [];
		this.message = [];
	}

	messageListner(msg){
		if (this.socket.rooms.length == undefined) {
			this.socket.join(currentRoom.id);
		}

		var message = {
			"name": this.socket.name,
			"message": msg
		}

		if (this.socket.name != null) {
			this.socket.to(currentRoom.id).emit('chat', message);
		}
	}
}

module.exports = {
	chat: Chat
};
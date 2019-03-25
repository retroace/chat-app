<template>
	<div class="row mb-0">
		<div class="col s3 teal lighten-2 vh-100" v-show="sidebar">
			<div class="jumbotron">
				<p class="flow-text white-text">Welcome to Chat Room</p>
				<p v-if="currentRoom.length">Current Room: {{ currentRoom.name }}</p>
			</div>
			<div class="blue-grey card horizontal space-between" style="padding: 0 10px;">
				<p class="title white-text flex-column-center">Chat rooms</p>
				<p class="transparent btn-floating" @click="openModel()">
					<i class="material-icons clickable white-text" title="Create Chat Room">
						add_circle_outline
					</i>
				</p>
			</div>
			<ul class="collection">
			    <li class="collection-item flex space-between" v-for="room in rooms">
			    	<a class="chat-room w-100 flex-column-center">
			    		{{ room.name }}
			    	</a>
			    	<button class="btn btn-primary" @click="joinRoom(room)" :disabled="currentRoom.id == room.id">
			    		{{ currentRoom.id == room.id ? 'Current' : 'Join' }}
			    	</button>
			    </li>
			</ul>
			<p class="clickable" @click="sidebar = false">Hide Sidebar</p>
		</div>


		<div class="relative flex-column bg-light vh-100 col s9" id="chat-section">
			<div class="flex-column-center v-all overlay all-0 f-column"  v-if="!registered">
				<div class="vertical-center flex-center col s6 m-auto">		
					<div class="input-field">
						<input placeholder="Enter Your Name" v-model="user.name" type="text" class="validate white-text" @keyup.enter="registerUser()">
					</div>
					<button type="submit" class="btn" @click="registerUser()">Submit</button>
				</div>

			</div>

			<!-- Chat title -->

			<div class="row mb-0">
				<div class="card horizontal justify absolute top">
					<div class="card-content teal lighten-1">
						<div v-if="status" class="white-text">{{ status }}</div>
						<span id="card-title" class="white-text" v-else>Say Hi in chat</span> 
					</div>
					<div class="card-action">
						<i id="beer" class="fa fa-beer action-beer fa-2x icon-padding clickable"></i>
						<i class="fa fa-arrow-right fa-2x icon-padding" @click="sidebar = true" v-show="!sidebar"></i>
						<i id="happy" class="fa fa-smile-o fa-2x icon-padding clickable" @click="happy()"></i>
						<i id="deleteTrash" class="fa fa-trash-o icon-padding clickable fa-2x" @click="clearMessage()"></i> 
					</div>
				</div> 
			</div>

			<!-- Chat message field -->
			<div class="flex flex-column overflowy-scroll mb-2" id="chat-message">
			    <div v-for="chat in chats">
			    	<div v-if="chat.name == user.name" class="flex-row-reverse">
			    		<i class="material-icons">person</i>
				    	<span class="blue lighten-5 chat-message">{{ chat.message }}</span>    		
			    	</div>
			    	<div v-else>
				    	<span class="chat-name">{{ chat.name }}</span>
				    	<span class="teal lighten-2 chat-message">{{ chat.message }}</span>
			    	</div>
			    </div>
			</div>
				
			<!-- Chat message field -->
			<div  class="w-100">
				<form id="chat-form" action="" method="" accept-charset="utf-8">
					<div class="input-field file-field">
						<div class="btn">
							<span>Message</span>
						</div>	
						<div class="file-path-wrapper">
							<textarea  class="materialize-textarea" v-model="message" rows="1" placeholder="Send A Message" @keyup.enter="sendMessage()"></textarea>
						</div>
					</div>
				</form>
			</div>
		</div>
		<div id="sound"></div>
		
		<div id="create-chat" class="modal">
			<div class="modal-content">
				<h4>Create A Chat Room</h4>
				<div class="input-field">
					<label for="name">Room name</label>
					<input type="text" v-model="room.name" autofocus>
				</div>
				<div class="input-field">
					<label for="passsword">Password</label>
					<input type="password" v-model="room.password">
				</div>
			</div>
			<div class="modal-footer">
				<a href="#!" @click="closeModel()" class="modal-close waves-effect waves-green btn-flat">Close</a>
				<button class="btn" @click="createRoom">Create And Join</button>
			</div>
		</div>
	</div>
</template>

<script>
	export default ({
		data(){
			return {
				rooms:[],
				sidebar: true,
				message:'',
				currentRoom: '',
				user:{
					name:''
				},
				room: {
					name: '',
					password: ''
				},
				model: false,
				chats: [],
				socket: null,
				registered: false,
				status: '',
				domModal: null
			};
		},
		created(){
			this.socket = window.socket;
			this.checkStorage();
		},
		mounted(){
			this.domModal = M.Modal.init(document.querySelector('#create-chat'));			
			this.getMessage();	
			this.getTopMessage();
			this.getRoom();
			this.joinedRoom();	
			this.getChatRooms();
		},
		methods: {
			chatDisabled(room){
				if(room.id = this.currentRoom.id)
				{
					return 'disabled';
				}
				return '';
			},
			joinedRoom(){
				this.socket.on('joinedRoom', (data)=>{
					this.currentRoom = data;
					this.chats = [];
				})
			},
			joinRoom(room){
				this.socket.emit('joinRoom',room);
			},
			getChatRooms(){
				this.socket.emit('getChatRooms');
				this.socket.on('chatRooms',(room) => {
					if (room.length > 0) {
						this.rooms = room;
					}
				});
			},
			checkStorage: function(){
				let content = window.localStorage.getItem('localChatStorage');
				if (content != null) {
					content = JSON.parse(content);
					this.user.name = content.name;
					this.registerUser();
				}
			},
			setStorage: function(){
				window.localStorage.setItem('localChatStorage',JSON.stringify(this.user))
			},

			removeStorage: function(){
				window.localStorage.removeItem('localChatStorage');
			},

			playSound: function (filename){
				// var mp3Source = '<source src="' + filename + '.mp3" type="audio/mpeg">';
				var oggSource = '<source src="/public/sounds/'+filename+'.ogg" type="audio/ogg">';
				var embedSource = '<embed hidden="true" autostart="true" loop="false" src="/public/sounds/' + filename +'.mp3">';
				document.getElementById("sound").innerHTML='<audio autoplay="autoplay">' + oggSource + embedSource + '</audio>';
			},
			happy: function(){
				this.playSound('aud');
			},
			sendMessage: function(){
				if (this.message.trim().length) {
					this.socket.emit('message', this.message);

					this.chats.push({
						name: this.user.name,
						message: this.message
					});

					this.message = '';
				}
				this.chatScroll();
			},
			chatScroll: function(){
				setTimeout(() => {
					let objDiv = document.getElementById("chat-message");
					objDiv.scrollTop = objDiv.scrollHeight;
				},400);

			},
			registerUser: function(){
				if (this.user.name.length > 0) {
					this.socket.emit('newUser',this.user);
					this.socket.emit('register', JSON.stringify(this.user));
					
					this.socket.on('registered', () => {
						this.registered = true;
						this.setStorage();
					});
				}
			},
			getMessage: function(){
				this.socket.on('chat', (message) => {
					this.chats.push({
						name: message.name,
						message: message.message
					});
					this.playSound('notification');
				
					this.chatScroll();
				});
			},
			getTopMessage: function(){
				this.socket.on('topMessage',(message) => {
					console.log("Messages",message);
					this.status = message;
				})
			},
			clearMessage: function(){
				this.chats = [];
			},
			getRoom: function(){
				this.socket.on('newRoom', (data) => {
					this.rooms.push(data);
				})
			},
			createRoom: function(){
				this.closeModel();
				socket.emit('newRoom',this.room);
				this.room = {
					name: '',
					password: ''
				};
			},
			closeModel(){
				this.domModal.close();
			},
			openModel(){
				this.domModal.open();
			}
		},
		watch: {
			model(){
				if (this.model) {
					this.domModal.openModel();
				}else{
					this.domModal.closeModel();
				}
			}
		}

	});
</script>


<style scoped="">
	#deleteTrash:hover{
		color: #EF9A9A;
	}
	#happy:hover{
		color: #f9a825;
	}
	#beer:hover{
		color: #ff8a65;
	}
</style>
<template>
	<div class="row mb-0 flex">
		<div class="col m3 teal darken-1 vh-100 left hide-on-small-only" v-show="sidebar">
			<Sidebar />
		</div>


		<div class="relative flex-column bg-light vh-100 col m9 s12" id="chat-section">
			<div class="flex-column-center v-all overlay all-0 f-column"  v-if="!registered">
				<div class="vertical-center flex-center col s6 m-auto">		
					<div class="input-field">
						<input placeholder="Enter Your Name" v-model="user.name" type="text" class="validate white-text" @keyup.enter="registerUser()" autofocus>
					</div>
					<button type="submit" class="btn" @click="registerUser()">Submit</button>
				</div>

			</div>

			<!-- Chat title -->

			<div class="row mb-0">
				<nav-bar 
					v-on:nav-actions="navActions($event)" 
					:sidebar="sidebar"
					/>
			</div>

			<!-- Chat message field -->
			<div class="flex flex-column overflowy-scroll mb-2" id="chat-message">
			    <div v-for="chat in $store.state.chats">
			    	<div v-if="(chat.name == user.name) && chat.action == false " class="flex-row-reverse">
			    		<i class="material-icons">person</i>
				    	<span class="blue lighten-5 chat-message">{{ chat.message }}</span>    		
			    	</div>
			    	<div v-else-if="chat.action == false">
				    	<span class="chat-name">{{ chat.name }}</span>
				    	<span class="teal lighten-2 chat-message">{{ chat.message }}</span>
			    	</div>
					<div class="user-tag flex" v-else>
						<span>>> {{ chat.name }} wants to say : </span>
						<span class="badge">{{ chat.message }}</span>
					</div>
			    </div>
			</div>
				
			<!-- Chat message field -->
			<div  class="w-100">
				<form id="chat-form" action="" method="" accept-charset="utf-8">
					<div class="input-field file-field mb-0">
						<div class="btn">
							<span>Message</span>
						</div>	
						<div class="file-path-wrapper">
							<textarea id="message" class="materialize-textarea" v-model="message" rows="1" placeholder="Send A Message" @keyup.enter="sendMessage()"></textarea>
						</div>
					</div>
				</form>
			</div>
		</div>
		<password-modal />
		<div id="sound"></div>
	</div>
</template>

<script>
	import passwordModal from './../modal/PasswordModal.vue';
	import Sidebar from './../sidebar/Sidebar.vue';
	export default ({
		components: {
			passwordModal,
			Sidebar
		},
		data(){
			return {
				passwordModal: false,
				rooms:[],
				sidebar: true,
				message:'',
				currentRoom: '',
				user:{
					name:''
				},
				room: null,
				onlineUsers: null,
				users: null,
				chats: [],
				socket: null,
				registered: false,
				status: '',
			};
		},
		created(){
			this.socket = window.socket;
			this.$store.commit('setSocket',this.socket);
			this.checkStorage();
		},
		mounted(){
			this.getMessage();	
			this.getRoom();
			this.joinedRoom();	
			this.leftRoom();
			this.getOnlineUsers();	
			this.getChatRooms();
			this.userEvents();
			this.unregistered();
		},
		methods: {
			unregistered(data){
				this.socket.on('unregistered', () => {
					this.checkStorage();
					this.socket.emit('message', this.chats);
				});
			},
			navActions(data){
				switch (data) {
					case 'clear-chat-message':
						this.$store.commit('removeAllChatMessages'); 
						break;
					case 'showSidebar':
						this.sidebar = true; 
						break;
					case 'action-beer':
						this.socket.emit('action',"beer"); 
						break;
					default:
						break;
				}
			},
			userEvents(){
				this.socket.on("userDisconnected", (data) => {
					this.status = data.name + " has disconnected from the chat";
				});

				this.socket.on("userConnected", (data) => {
					this.status = data.name + " has connected to chat";
				});

				this.socket.on("taggedUser", (data) => {
					this.status = data.name + " has connected to chat";
				});

				this.socket.on("action", (data) => {
					switch(data.name){
						case 'sayInChat':
							this.$store.commit('setChats', {
								name: data.user,
								message: this.filterEmojiFromText(data.message),
								action: true
							});
							break;
						default:
							return null;
							break;
					}
				});
			},
			getOnlineUsers(){
				this.socket.on('onlineUsers', (data) => {
					const { total , users } = data;
					this.$store.commit('setUsers', users);
				});
			},
			joinedRoom(){
				this.socket.on('joinedRoom', (data)=>{
					this.currentRoom = data;
					this.$store.dispatch('joinedRoom', data);
				})
			},
			leftRoom(user){
				this.socket.on('leaveRoom',() => {
					this.currentRoom = {id : ''};
				});
				
				// User leaved the chat
				this.socket.on('userLeft',(data) => {

				});

				// User joined the chat
				this.socket.on('userJoin',(data) => {
				});
			},
			leaveRoom(room){
				this.socket.emit('leaveRoom',room);
			},
			joinRoom(room){
				// Room has password
				if (room.password) {
					this.room = room;
					this.passwordModal = true;
				}else{
					// No password
					this.socket.emit('joinRoom',room);
				}
			},
			getChatRooms(){
				this.socket.emit('getChatRooms');
				this.socket.on('chatRooms',(room) => {
					if (room.length > 0) {
						this.$store.commit('setRooms',room);						
					}
				});
			},
			checkStorage: function(){
				let content = window.localStorage.getItem('localChatStorage');
				if (content != null) {
					content = JSON.parse(content);
					this.user.name = content.name;
					this.$store.commit('setUser',content);
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
			sendMessage: function(){
				if (this.message.trim().length) {
					if(this.message.trim().substr(0,10) == "\\sayInChat")
					{
						this.anounce(this.message);
					}else{
						this.chats = this.message;
						this.socket.emit('message', this.message);
					}
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
					this.socket.emit('newUser',this.$store.state.user);
					
					this.socket.on('registered', () => {
						this.registered = true;
						this.setStorage();
					});
				}
			},
			getMessage: function(){
				this.socket.on('chat', (message) => {
					let data = {
						name: message.name,
						message: this.filterEmojiFromText(message.message),
						action: false
					};
					this.$store.commit('setChats', data);
					
					if(data.name !== this.user.name)
					{
						this.playSound('notification');
					}
				
					this.chatScroll();
				});
			},
			getRoom: function(){
				this.socket.on('newRoom', (data) => {
					this.$store.commit('appendRooms', data);
				})
			},
			anounce(data){
				this.socket.emit('action',{
					name: "sayInChat", 
					message: data.substr(10)
				});
			},
			filterEmojiFromText(text){
				var emojis = [ 
					[":D","😂"],
					[":)","🙂"],
					[":))","😀"],
					[":P","😜"],
					[":>P<","😝"],
					[":><","😄"],
					[">:(","😆"],
					[":'","😅"],
					["","🤣"],
					["^_^","😊"],
					[":.).","️😌"],
					[":.<","😉"],
					[":`)","😏"],
					[":LO","😍"],
					[":cl","😘"],
					[":c","😗"],
					[":()","🤑"],
					[":O-O","😎"],
					[":O-|O","🤓"],
					[":O.O","😶"],
					[":-_-","😑"],
					[":-(","😞"],
					[":-O|","😱"],
					[":ED","😈"],
					[":OP","😛"],
					[":E-)","😇"],
					[":)-D","🙃"],
					[":OO","😳"],
					[":H)","🤗"],
					[":L(","😚"],
					[":L<","😙"],
					[":>(","😒"],
					[":TU","🤔"],
					[":A","👽"],
					[":G","👻"],
					[":S","😪"],
					[":Z","😴"],
					[":S<","🤡"],
					[":GP","🤢"],
					[":flu","😷"],
					[":A(","😡"],
					[":AO(","😠"],
					[":O^O","🙄"],
					[":>>","😔"],
					[":><","😖"],
					[":'D","😓"],
					[":'D","😢"],
					[":|O|","😭"],
					[":shock","😨"],
					[":cryshock","😰"],
					[":bioshock","😱"],
					[":tired","😫"],
					[":verytired","😩"],
					[":closeeye","😣"],
					[":devil3","👿"],
					[":devil","👹"],
					[":devil2","👺"],
					[":hat","🤠"],
					[":headbandage","🤕"],
					[":sneez","🤧"],
					[":notalk","😐"],
				];

				// Regex start with whitespace but break in whitespace
				// /(\s+:\S*)/g
				text = " "+text.trim();
				
				return text.toString().replace(/(\s+:\S*)/g,(data) => {
					for(var i =0 ; i < emojis.length; i++){
						if(data.trim().toLowerCase() == emojis[i][0].toLowerCase()){
							return " "+emojis[i][1];
						}
					}
					return data ;
				});
			}
		},
		watch:{
			message(){
				// Making tagging feature on @ keypress
				// if(this.message[this.message.length-1] == '@') {

				// }
			}
		}

	});
</script>


<style scoped="">
	.user-tag{
		background: #0000000d;
		padding: 10px;
		font-weight: bold;
	}
</style>
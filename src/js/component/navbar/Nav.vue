<template>
    <div class="card horizontal pb-0 justify absolute top w-100 mt-0">
        
        <div class="card-content flex-column-center pt-0 pb-0 teal lighten-1 hide-on-small-only">
            <p id="card-title" class="white-text">Confused about how to start? Say Hi</p> 
        </div>
        
        <!-- Navigation On Small Screen -->
        <mobileNav 
            @create-room="modal = true"
        />  

        <!-- Navigation On Big Screen -->
        <div class="card-action w-100 pb-0 pt-0 hide-on-small-only">
            <div class="flex justify-space-between">
                <div class="w-100">
                    <ul class="collection">
                        <li class="collection-item avatar">
                            <img src="images/yuna.jpg" alt="" class="circle">
                            <span class="title">{{ $store.state.currentRoom.name }}</span>
                            <div>
                                Online Users: {{ $store.state.users.length }}
                                <br />
                                <span class="icon-padding" v-if="user" v-for="user in $store.state.users">
                                    {{ user }}
                                </span>
                            </div>
                            <a href="#!" class="secondary-content">
                                <p class="addIcon" @click="openModal()">
                                    <i class="material-icons clickable" title="Create Chat Room">
                                        add_circle_outline
                                    </i>
                                </p>
                            </a>
                        </li>
                    </ul>
                    <!-- <div v-if="status" class="teal-text">{{ status }}</div>
                    <p :class="serverErrorClass">{{serverMessages.content}}</p> -->
                </div>
                <div class="flex flex-row">
                    <div class="px-10 pt-0 pb-0 flex hover-blue flex-column-center" v-show="!sidebar">
                        <i class="fa fa-arrow-right fa-2x icon-padding" @click="$emit('nav-actions','showSidebar')"></i>
                    </div>
                    <div class="px-10 pt-0 pb-0 flex hover-yellow flex-column-center">
                        <i id="happy" class="fa fa-smile-o fa-2x icon-padding clickable" @click="$store.dispatch('happy')"></i>
                    </div>
                    <div class="px-10 pt-0 pb-0 flex hover-red flex-column-center">
                        <i id="deleteTrash" class="fa fa-trash-o icon-padding clickable fa-2x" @click="$store.commit('removeAllChatMessages')"></i> 
                    </div>
                </div>
            </div>
        </div>
        
        <div id="create-chat" class="modal">
			<div class="modal-content">
				<h4>Create A Chat Room</h4>
				<div class="input-field">
					<label for="name">Room name</label>
					<input type="text" v-model="room.name" ref="roomname">
				</div>
				<div class="input-field">
					<label for="passsword">Password</label>
					<input type="password" v-model="room.password">
				</div>
			</div>
			<div class="modal-footer">
				<a href="#!" @click="closeModel()" class="modal-close waves-effect waves-green btn-flat">Close</a>
				<button class="btn" @click="createRoom()">Create And Join</button>
			</div>
		</div>
    </div>    
</template>

<script>
import mobileNav from './mobileNav.vue';
export default {
    props: ['sidebar'],
    components:{
        mobileNav
    },
    data(){
        return {
            socket: null,
            joinedRoom: { 
                "name": "Global Room", 
            },
            room: {
                name: '',
                password: ''
            },
            join: {
                data: null,
                name: null,
                password: null
            },
            domModal: null,
        }
    },
    created(){
        this.socket = window.socket;
        this.domModal = M.Modal.init(window.document.querySelector('#create-chat'));			
    },
    methods: {
        closeModel: function(){
            if(this.domModal === null){
                this.domModal = M.Modal.init(window.document.querySelector('#create-chat'));			
            }

            if (this.domModal.isOpen) {
                this.domModal.close();
                let data = {
                    name: '',
                    password: ''
                };
                this.room = data;
            }
        },
        createRoom: function(){
            let data = {
                name: '',
                password: ''
            };
            if(this.room.name.length > 2 ){
                this.$store.dispatch('createRoom',this.room);
                this.closeModel();
            }
        },
        openModal(){
            if(this.domModal === null){
                this.domModal = M.Modal.init(window.document.querySelector('#create-chat'));			
            }
            if (!this.domModal.isOpen) {
                this.domModal.open();
                this.$refs.roomname.focus();
            }
        }
    }
}
</script>
<style>
    .p-10{
        padding: 10px;
    }
    .hover-blue:hover{
        background: #3456e211;
    }
    .hover-yellow:hover{
        background-color: #fbe1004a;
    }
    .hover-red:hover{
        background-color: #ff00004d;
    }
    .pb-0{
        padding-bottom: 0 !important;
    }
    .pt-0{
        padding-top: 0 !important;
    }
    .px-10{
        padding-right: 10px;
        padding-left: 10px;
    }
    .addIcon > i {
        font-size: 3.4rem;
        color: #25897b;
    }

    .addIcon > i:hover {
        font-size: 3.4rem;
        color: #25897b;
        box-shadow: 0px 0px 0px 2px #00000010;
        background: #00000004;
    }
    .mobile{
        z-index: 4;
        position: relative;
        margin: 0;
    }
</style>
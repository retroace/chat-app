<template>
    <div class="w-100 bg-light hide-on-med-and-up">
        <div class="flex p-10 space-between" v-if="!navOpen">
            <a href="#" @click="navOpen = true">
                <i class="material-icons">menu</i>
            </a>
            <p class="pt-0 pb-0 mt-0 mb-0">Online Users: <span class="badge teal lighten-2 white-text">{{ currentUsers.length }}</span></p>
        </div>

        
        <ul v-if="navOpen" class="sidenav collection mobile teal vh-100">
            <li>
                <div class="flex space-between">
                    <p class="flow-text white-text">Welcome to Chat Room</p>
                    <div class="flow-text white-text flex-column-center" @click="navOpen = false">
                        <i class="material-icons p-10">arrow_back</i>
                    </div>
                </div>
                <div class="blue-grey card horizontal w-100" style="padding: 0 10px;">
                    <p class="title white-text flex-column-center">Chat rooms</p>
                </div>
                <ul class="collection">
                    <li class="collection-item flex space-between" v-for="room in $store.state.rooms">
                        <a class="chat-room w-100 flex-column-center">
                            {{ room.name }}
                        </a>
                        <div v-if="$store.state.currentRoom.id == room.id">
                            <button class="btn btn-primary" @click="$store.dispatch('leaveRoom',room)">
                                Leave
                            </button>
                        </div>
                        <div v-else>
                            <button class="btn btn-primary" @click="$store.dispatch('joinRoom',room)">
                                Join
                            </button>
                        </div>
                    </li>
                </ul>
            </li>
            <li class="collection-item">
                <a href="#!" @click="$store.dispatch('openCreateRoomModal')">Create A Room</a>
            </li>
            <li>
                <div class="divider"></div>
            </li>
            <li>
                <a class="subheader white-text">Subheader</a>
            </li>
        </ul>
    </div>
</template>
<script>
export default {
    data(){
        return{
            joinedRoom: null,
            navOpen: false,
            mobileNav: false,
            rooms: false,
            currentUsers: [],
        }
    },
    mounted(){

    },
}
</script>
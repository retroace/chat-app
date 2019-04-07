<template>
    <div>
        <div class="jumbotron">
            <p class="flow-text white-text">Welcome to Chat Room</p>
        </div>
        <div class="blue-grey card horizontal space-between w-100" style="padding: 0 10px;">
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
                    <button class="btn btn-primary" @click="$store.dispatch('joinRoomModal',room)">
                        Join
                    </button>
                </div>
            </li>
        </ul>
    </div>
</template>
<script>
export default {
    data() {
        return {
        };
    }
}
</script>

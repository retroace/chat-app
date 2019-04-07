<template>
    <div id="get-password" class="modal">
        <div class="modal-content">
            <h4>Join Room {{ join.name }} ({{ $store.state.joinRoom.name }})</h4>
            <p class="red-text" v-if="error">{{ error }}</p>
            <div class="input-field">
                <input type="text" name="name" disabled :value="$store.state.joinRoom.name">
            </div>
            <div class="input-field">
                <label for="password">Password</label>
                <input type="password" name="password" v-model="join.password">
            </div>
        </div>
        <div class="modal-footer">
            <a href="#!" @click="closeModel()" class="modal-close waves-effect waves-green btn-flat">Close</a>
            <button class="btn" @click="joinRoom()">Join Room</button>
        </div>
    </div>
</template>
<script>
export default {
    data(){
        return {
            join: {
                name: '',
                password: ''
            },
            error: ''
        };
    },
    mounted(){
        window.socket.on('joinRoomError', (data) => {
            this.error = data.message;
        });
    },
    methods: {
        joinRoom(data){
            let room = this.$store.state.joinRoom;
            room.password = this.join.password;
            this.$store.commit('setJoinRoom',room);
            this.$store.dispatch('joinRoom',room);
        }
    }
}
</script>
